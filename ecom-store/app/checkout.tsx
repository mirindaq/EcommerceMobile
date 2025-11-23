import {
  Box,
  Button,
  ButtonText,
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
  HStack,
  Icon,
  Input,
  InputField,
  Pressable,
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
  SafeAreaView,
  ScrollView,
  Text,
  Textarea,
  TextareaInput,
  VStack,
  View,
} from "@/components/ui";
import { orderService } from "@/services/order.service";
import { voucherService } from "@/services/voucher.service";
import { authService } from "@/services/auth.service";
import { productService } from "@/services/product.service";
import { addressService } from "@/services/address.service";
import { provinceService } from "@/services/province.service";
import type { CartDetailResponse } from "@/types/cart.type";
import type { VoucherAvailableResponse } from "@/types/voucher.type";
import type { PaymentMethod } from "@/types/order.type";
import type { UserProfile } from "@/types/auth.type";
import type { Address } from "@/types/address.type";
import type { Province } from "@/types/province.type";
import type { Ward } from "@/types/ward.type";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeftIcon,
  CheckIcon,
  CircleIcon,
  TagIcon,
  MapPinIcon,
  ChevronRightIcon,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Linking, Modal } from "react-native";

type CheckoutStep = "info" | "payment";

interface CheckoutFormData {
  email: string;
  subscribeEmail: boolean;
  isPickup: boolean;
  selectedAddressId?: number;
  subAddress?: string;
  wardId?: number;
  provinceId?: number;
  receiverPhone?: string;
  receiverName?: string;
  note: string;
  voucherId?: number;
  paymentMethod?: PaymentMethod;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse selectedItems from params
  const selectedItems: CartDetailResponse[] = params.selectedItems
    ? JSON.parse(params.selectedItems as string)
    : [];

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("info");
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatedItems, setUpdatedItems] = useState<CartDetailResponse[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [availableVouchers, setAvailableVouchers] = useState<
    VoucherAvailableResponse[]
  >([]);
  const [selectedVoucher, setSelectedVoucher] =
    useState<VoucherAvailableResponse | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // Address states
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  const [formData, setFormData] = useState<CheckoutFormData>({
    email: "",
    subscribeEmail: false,
    isPickup: true,
    note: "",
    paymentMethod: "CASH_ON_DELIVERY",
  });

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const response = await authService.getProfile();
        const profile = response.data.data;
        setUserProfile(profile);
        setFormData((prev) => ({
          ...prev,
          email: profile.email || "",
        }));
      } catch (error) {
        console.error("Error fetching profile:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin tài khoản");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch latest promotions
  useEffect(() => {
    const fetchLatestPromotions = async () => {
      if (selectedItems.length === 0) {
        setIsLoadingPromotions(false);
        return;
      }

      try {
        setIsLoadingPromotions(true);
        const productVariantIds = selectedItems.map(
          (item) => item.productVariantId
        );

        const promotions = await productService.getProductsVariantPromotions({
          productVariantIds,
        });

        const itemsWithLatestPromotions = selectedItems.map((item) => {
          const promotion = promotions.data.find(
            (p) => p.productVariantId === item.productVariantId
          );
          return {
            ...item,
            discount: promotion?.discount ?? 0,
          };
        });

        setUpdatedItems(itemsWithLatestPromotions);
      } catch (error) {
        console.error("Error fetching promotions:", error);
        setUpdatedItems(selectedItems);
      } finally {
        setIsLoadingPromotions(false);
      }
    };

    fetchLatestPromotions();
  }, []);

  // Fetch available vouchers
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setIsLoadingVouchers(true);
        const vouchers = await voucherService.getAvailableVouchers();
        setAvailableVouchers(Array.isArray(vouchers) ? vouchers : []);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
        setAvailableVouchers([]);
      } finally {
        setIsLoadingVouchers(false);
      }
    };

    fetchVouchers();
  }, []);

  // Fetch addresses and provinces
  useEffect(() => {
    const fetchAddressesAndProvinces = async () => {
      try {
        setIsLoadingAddresses(true);
        const [addressesData, provincesData] = await Promise.all([
          addressService.getAddresses(),
          provinceService.getAllProvinces(),
        ]);

        // Set provinces first
        setProvinces(provincesData);
        setAddresses(addressesData);

        // Set default address if exists
        const defaultAddress = addressesData.find(
          (addr: Address) => addr.isDefault
        );

        if (defaultAddress) {
          const provinceId = defaultAddress.provinceId;
          const wardId = defaultAddress.wardId;

          // Load wards for default address's province
          if (provinceId) {
            try {
              const allWards = await provinceService.getWardsByProvince(
                provinceId
              );
              setWards(allWards);

              // Set form data after wards are loaded
              setFormData((prev) => ({
                ...prev,
                selectedAddressId: defaultAddress.id,
                receiverName: defaultAddress.fullName,
                receiverPhone: defaultAddress.phone,
                subAddress: defaultAddress.subAddress,
                wardId: wardId,
                provinceId: provinceId,
              }));
            } catch (error) {
              console.error("Error loading wards for default address:", error);
              // Still set form data even if wards fail to load
              setFormData((prev) => ({
                ...prev,
                selectedAddressId: defaultAddress.id,
                receiverName: defaultAddress.fullName,
                receiverPhone: defaultAddress.phone,
                subAddress: defaultAddress.subAddress,
                wardId: wardId,
                provinceId: provinceId,
              }));
            }
          } else {
            // No province, just set basic info
            setFormData((prev) => ({
              ...prev,
              selectedAddressId: defaultAddress.id,
              receiverName: defaultAddress.fullName,
              receiverPhone: defaultAddress.phone,
              subAddress: defaultAddress.subAddress,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddressesAndProvinces();
  }, []);

  const itemsToDisplay = updatedItems.length > 0 ? updatedItems : selectedItems;

  // Calculate prices
  const calculateSubtotal = () => {
    return itemsToDisplay.reduce((total, item) => {
      const discountedPrice = item.price * (1 - item.discount / 100);
      return total + discountedPrice * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shippingFee = 0;
  const rankDiscount = userProfile?.rank?.discountRate || 0;
  const rankDiscountAmount = subtotal * (rankDiscount / 100);
  const subtotalAfterRank = subtotal - rankDiscountAmount;

  let voucherDiscountAmount = 0;
  if (selectedVoucher && subtotalAfterRank >= selectedVoucher.minOrderAmount) {
    const calculatedDiscount =
      subtotalAfterRank * (selectedVoucher.discount / 100);
    voucherDiscountAmount = Math.min(
      calculatedDiscount,
      selectedVoucher.maxDiscountAmount
    );
  }

  const total =
    subtotal + shippingFee - rankDiscountAmount - voucherDiscountAmount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleInputChange = (field: keyof CheckoutFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Helper to get selected address
  const getSelectedAddress = () => {
    if (!formData.selectedAddressId) return null;
    return addresses.find((addr) => addr.id === formData.selectedAddressId);
  };

  // Helper to get full address string
  const getFullAddressString = () => {
    const selectedAddress = getSelectedAddress();
    if (selectedAddress) {
      return (
        selectedAddress.fullAddress ||
        `${selectedAddress.subAddress}, ${selectedAddress.wardName || ""}, ${
          selectedAddress.provinceName || ""
        }`
      );
    }

    if (formData.subAddress && formData.wardId) {
      const ward = wards.find((w) => w.id === formData.wardId);
      const province = provinces.find((p) => p.id === formData.provinceId);
      return `${formData.subAddress}, ${ward?.name || ""}, ${
        province?.name || ""
      }`;
    }

    return formData.subAddress || "";
  };

  // Load wards when province is selected
  const handleProvinceSelect = async (provinceId: number) => {
    try {
      const wardsData = await provinceService.getWardsByProvince(provinceId);
      setWards(wardsData);
      setFormData((prev) => ({
        ...prev,
        provinceId,
        wardId: undefined,
      }));
      setShowProvinceModal(false);
      setShowWardModal(true);
    } catch (error) {
      console.error("Error fetching wards:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách phường/xã");
    }
  };

  // Handle ward selection
  const handleWardSelect = (wardId: number) => {
    setFormData((prev) => ({
      ...prev,
      wardId,
    }));
    setShowWardModal(false);
  };

  // Handle address selection from saved addresses
  const handleAddressSelect = async (address: Address) => {
    // Load wards for selected address's province
    if (address.provinceId) {
      try {
        const wardsData = await provinceService.getWardsByProvince(
          address.provinceId
        );
        setWards(wardsData);
      } catch (error) {
        console.error("Error loading wards for selected address:", error);
      }
    }

    setFormData((prev) => ({
      ...prev,
      selectedAddressId: address.id,
      receiverName: address.fullName,
      receiverPhone: address.phone,
      subAddress: address.subAddress,
      wardId: address.wardId,
      provinceId: address.provinceId,
    }));
    setShowAddressModal(false);
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return false;
    }

    if (!formData.isPickup) {
      if (!formData.receiverName?.trim()) {
        Alert.alert("Lỗi", "Vui lòng nhập tên người nhận");
        return false;
      }
      if (!formData.receiverPhone?.trim()) {
        Alert.alert("Lỗi", "Vui lòng nhập số điện thoại người nhận");
        return false;
      }
      if (!formData.subAddress?.trim()) {
        Alert.alert("Lỗi", "Vui lòng nhập địa chỉ cụ thể");
        return false;
      }
      if (!formData.wardId) {
        Alert.alert("Lỗi", "Vui lòng chọn phường/xã");
        return false;
      }
    }

    return true;
  };

  const handleContinueToPayment = () => {
    if (!validateForm()) return;
    setCurrentStep("payment");
  };

  const handleSubmit = async () => {
    if (!formData.paymentMethod) {
      Alert.alert("Lỗi", "Vui lòng chọn phương thức thanh toán");
      return;
    }

    try {
      setIsSubmitting(true);

      const fullAddress = getFullAddressString();

      const orderData = {
        receiverAddress: fullAddress,
        receiverName: formData.receiverName || userProfile?.fullName || "",
        receiverPhone: formData.receiverPhone || userProfile?.phone || "",
        note: formData.note || "",
        subscribeEmail: formData.subscribeEmail,
        email: formData.email,
        isPickup: formData.isPickup,
        voucherId: selectedVoucher?.id || null,
        paymentMethod: formData.paymentMethod,
        cartItemIds: selectedItems.map((item) => item.id),
        platform: "mobile",
      };

      const response = await orderService.createOrder(orderData);

      // Check if response contains payment URL
      if (response.data && typeof response.data === "string") {
        // Payment URL - open in browser
        Alert.alert("Thanh toán", "Đang chuyển đến trang thanh toán...", [
          {
            text: "OK",
            onPress: async () => {
              const supported = await Linking.canOpenURL(response.data);
              if (supported) {
                await Linking.openURL(response.data);
              }
            },
          },
        ]);
      } else {
        // Order created successfully (COD)
        Alert.alert("Thành công", "Đặt hàng thành công!", [
          {
            text: "OK",
            onPress: () => router.replace("/"),
          },
        ]);
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "Không thể tạo đơn hàng. Vui lòng thử lại!";
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (selectedItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Box className="bg-white px-4 py-3 border-b border-gray-200">
          <Pressable onPress={() => router.back()}>
            <ArrowLeftIcon size={24} color="#000" />
          </Pressable>
        </Box>
        <Box className="flex-1 items-center justify-center px-4">
          <Text className="text-xl font-semibold text-gray-600 mb-2">
            Không có sản phẩm nào
          </Text>
          <Text className="text-gray-500 mb-6">
            Vui lòng chọn sản phẩm từ giỏ hàng
          </Text>
          <Button onPress={() => router.push("/cart")}>
            <ButtonText>Quay lại giỏ hàng</ButtonText>
          </Button>
        </Box>
      </SafeAreaView>
    );
  }

  if (isLoadingPromotions || isLoadingProfile) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EF4444" />
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <Box className="bg-white px-4 py-3 border-b border-gray-200">
        <HStack className="items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <ArrowLeftIcon size={24} color="#000" />
          </Pressable>
          <Text className="text-lg font-semibold">
            {currentStep === "info" ? "Thông tin" : "Thanh toán"}
          </Text>
          <Box style={{ width: 24 }} />
        </HStack>
      </Box>

      {/* Tab Navigation */}
      <HStack className="bg-white">
        <Pressable
          onPress={() => setCurrentStep("info")}
          className={`flex-1 py-4 items-center border-b-2 ${
            currentStep === "info" ? "border-red-600" : "border-gray-200"
          }`}
        >
          <Text
            className={`font-semibold ${
              currentStep === "info" ? "text-red-600" : "text-gray-400"
            }`}
          >
            1. THÔNG TIN
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            if (validateForm()) {
              setCurrentStep("payment");
            }
          }}
          className={`flex-1 py-4 items-center border-b-2 ${
            currentStep === "payment" ? "border-red-600" : "border-gray-200"
          }`}
        >
          <Text
            className={`font-semibold ${
              currentStep === "payment" ? "text-red-600" : "text-gray-400"
            }`}
          >
            2. THANH TOÁN
          </Text>
        </Pressable>
      </HStack>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Step 1: Information */}
        {currentStep === "info" && (
          <VStack className="p-4 gap-4">
            {/* Product Summary */}
            <Box className="bg-white rounded-lg border border-gray-200 p-4">
              {itemsToDisplay.map((item, index) => (
                <Box
                  key={item.productVariantId}
                  className={`flex-row gap-3 ${
                    index < itemsToDisplay.length - 1
                      ? "pb-4 mb-4 border-b border-gray-200"
                      : ""
                  }`}
                >
                  <Image
                    source={{ uri: item.productImage }}
                    className="w-16 h-16 rounded bg-gray-100"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <Text numberOfLines={2} className="text-sm mb-1">
                      {item.productName}
                    </Text>
                    <HStack className="items-center justify-between">
                      <View>
                        <Text className="text-red-600 font-semibold">
                          {formatPrice(item.price * (1 - item.discount / 100))}
                        </Text>
                        {item.discount > 0 && (
                          <Text className="text-gray-400 line-through text-xs">
                            {formatPrice(item.price)}
                          </Text>
                        )}
                      </View>
                      <Text className="text-sm text-gray-600">
                        SL: {item.quantity}
                      </Text>
                    </HStack>
                  </View>
                </Box>
              ))}
            </Box>

            {/* Customer Information */}
            <Box className="bg-white rounded-lg border border-gray-200 p-4">
              <Text className="font-semibold mb-4 text-gray-700">
                THÔNG TIN KHÁCH HÀNG
              </Text>

              <VStack className="gap-3">
                <Box className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <HStack className="items-center justify-between mb-2">
                    <Text className="font-semibold text-gray-900">
                      {userProfile?.fullName || "Khách hàng"}
                    </Text>
                    {userProfile?.rank && (
                      <Box className="bg-amber-100 px-2 py-1 rounded">
                        <Text className="text-xs text-amber-700 font-medium">
                          {userProfile.rank.name}
                        </Text>
                      </Box>
                    )}
                  </HStack>
                  {userProfile?.phone && (
                    <Text className="text-sm text-gray-600">
                      {userProfile.phone}
                    </Text>
                  )}

                  <VStack className="mt-3 gap-1">
                    <Text className="font-medium text-gray-500 text-xs">
                      EMAIL
                    </Text>
                    <Input variant="outline" size="md">
                      <InputField
                        placeholder="Nhập email"
                        value={formData.email}
                        onChangeText={(value) =>
                          handleInputChange("email", value)
                        }
                        keyboardType="email-address"
                      />
                    </Input>
                  </VStack>
                </Box>

                <HStack className="items-start gap-2">
                  <Checkbox
                    value="subscribe"
                    isChecked={formData.subscribeEmail}
                    onChange={(checked) =>
                      handleInputChange("subscribeEmail", checked)
                    }
                  >
                    <CheckboxIndicator
                      className={`w-5 h-5 rounded border ${
                        formData.subscribeEmail
                          ? "bg-red-600 border-red-600"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      <CheckboxIcon as={CheckIcon} color="#fff" />
                    </CheckboxIndicator>
                    <CheckboxLabel className="text-sm ml-2">
                      Nhận email thông báo và ưu đãi
                    </CheckboxLabel>
                  </Checkbox>
                </HStack>

                <Text className="text-xs text-gray-500 italic">
                  (*) Hóa đơn VAT sẽ được gửi qua email này
                </Text>
              </VStack>
            </Box>

            {/* Delivery Information */}
            <Box className="bg-white rounded-lg border border-gray-200 p-4">
              <Text className="font-semibold mb-4 text-gray-700">
                THÔNG TIN NHẬN HÀNG
              </Text>

              <RadioGroup
                value={formData.isPickup ? "pickup" : "delivery"}
                onChange={(value) =>
                  handleInputChange("isPickup", value === "pickup")
                }
              >
                <HStack className="gap-3 mb-4">
                  <Pressable
                    onPress={() => handleInputChange("isPickup", true)}
                    className={`flex-1 p-3 border-2 rounded-lg ${
                      formData.isPickup
                        ? "border-red-600 bg-red-50"
                        : "border-gray-300"
                    }`}
                  >
                    <Radio value="pickup">
                      <HStack className="items-center gap-2">
                        <RadioIndicator>
                          <RadioIcon as={CircleIcon} />
                        </RadioIndicator>
                        <RadioLabel className="text-sm">
                          Nhận tại cửa hàng
                        </RadioLabel>
                      </HStack>
                    </Radio>
                  </Pressable>

                  <Pressable
                    onPress={() => handleInputChange("isPickup", false)}
                    className={`flex-1 p-3 border-2 rounded-lg ${
                      !formData.isPickup
                        ? "border-red-600 bg-red-50"
                        : "border-gray-300"
                    }`}
                  >
                    <Radio value="delivery">
                      <HStack className="items-center gap-2">
                        <RadioIndicator>
                          <RadioIcon as={CircleIcon} />
                        </RadioIndicator>
                        <RadioLabel className="text-sm">
                          Giao hàng tận nơi
                        </RadioLabel>
                      </HStack>
                    </Radio>
                  </Pressable>
                </HStack>
              </RadioGroup>

              {formData.isPickup ? (
                <VStack className="gap-2">
                  <Text className="text-sm">Ghi chú (nếu có)</Text>
                  <Textarea>
                    <TextareaInput
                      placeholder="Nhập ghi chú..."
                      value={formData.note}
                      onChangeText={(value) => handleInputChange("note", value)}
                    />
                  </Textarea>
                </VStack>
              ) : (
                <VStack className="gap-3">
                  {/* Chọn địa chỉ đã lưu */}
                  {addresses.length > 0 && (
                    <VStack className="gap-1">
                      <Text className="text-sm font-medium">
                        Địa chỉ đã lưu
                      </Text>
                      <Pressable
                        onPress={() => setShowAddressModal(true)}
                        className="border-2 border-gray-300 rounded-lg p-3"
                      >
                        <HStack className="items-center justify-between">
                          <HStack className="items-center gap-2 flex-1">
                            <Icon
                              as={MapPinIcon}
                              size="sm"
                              className="text-gray-600"
                            />
                            <Text className="text-sm flex-1" numberOfLines={1}>
                              {getSelectedAddress()
                                ? `${getSelectedAddress()?.fullName} - ${
                                    getSelectedAddress()?.phone
                                  }`
                                : "Chọn địa chỉ"}
                            </Text>
                          </HStack>
                          <Icon
                            as={ChevronRightIcon}
                            size="sm"
                            className="text-gray-400"
                          />
                        </HStack>
                        {getSelectedAddress() && (
                          <Text className="text-xs text-gray-500 mt-1">
                            {getSelectedAddress()?.fullAddress}
                          </Text>
                        )}
                      </Pressable>
                    </VStack>
                  )}

                  {/* Hoặc nhập địa chỉ mới */}
                  <VStack className="gap-1">
                    <Text className="text-sm">
                      Tên người nhận <Text className="text-red-600">*</Text>
                    </Text>
                    <Input>
                      <InputField
                        placeholder="Nhập tên người nhận"
                        value={formData.receiverName || ""}
                        onChangeText={(value) =>
                          handleInputChange("receiverName", value)
                        }
                      />
                    </Input>
                  </VStack>

                  <VStack className="gap-1">
                    <Text className="text-sm">
                      Số điện thoại <Text className="text-red-600">*</Text>
                    </Text>
                    <Input>
                      <InputField
                        placeholder="Nhập số điện thoại"
                        value={formData.receiverPhone || ""}
                        onChangeText={(value) =>
                          handleInputChange("receiverPhone", value)
                        }
                        keyboardType="phone-pad"
                      />
                    </Input>
                  </VStack>

                  {/* Chọn Tỉnh/Thành phố */}
                  <VStack className="gap-1">
                    <Text className="text-sm">
                      Tỉnh/Thành phố <Text className="text-red-600">*</Text>
                    </Text>
                    <Pressable
                      onPress={() => setShowProvinceModal(true)}
                      className="border border-gray-300 rounded-lg p-3"
                    >
                      <HStack className="items-center justify-between">
                        <Text
                          className={
                            formData.provinceId
                              ? "text-gray-900"
                              : "text-gray-400"
                          }
                        >
                          {formData.provinceId
                            ? provinces.find(
                                (p) => p.id === formData.provinceId
                              )?.name
                            : "Chọn tỉnh/thành phố"}
                        </Text>
                        <Icon
                          as={ChevronRightIcon}
                          size="sm"
                          className="text-gray-400"
                        />
                      </HStack>
                    </Pressable>
                  </VStack>

                  {/* Chọn Phường/Xã */}
                  <VStack className="gap-1">
                    <Text className="text-sm">
                      Phường/Xã <Text className="text-red-600">*</Text>
                    </Text>
                    <Pressable
                      onPress={() => {
                        if (!formData.provinceId) {
                          Alert.alert(
                            "Thông báo",
                            "Vui lòng chọn tỉnh/thành phố trước"
                          );
                          return;
                        }
                        setShowWardModal(true);
                      }}
                      className="border border-gray-300 rounded-lg p-3"
                    >
                      <HStack className="items-center justify-between">
                        <Text
                          className={
                            formData.wardId ? "text-gray-900" : "text-gray-400"
                          }
                        >
                          {formData.wardId
                            ? wards.find((w) => w.id === formData.wardId)?.name
                            : "Chọn phường/xã"}
                        </Text>
                        <Icon
                          as={ChevronRightIcon}
                          size="sm"
                          className="text-gray-400"
                        />
                      </HStack>
                    </Pressable>
                  </VStack>

                  {/* Địa chỉ cụ thể */}
                  <VStack className="gap-1">
                    <Text className="text-sm">
                      Địa chỉ cụ thể <Text className="text-red-600">*</Text>
                    </Text>
                    <Textarea>
                      <TextareaInput
                        placeholder="Số nhà, tên đường..."
                        value={formData.subAddress || ""}
                        onChangeText={(value) =>
                          handleInputChange("subAddress", value)
                        }
                      />
                    </Textarea>
                  </VStack>

                  <VStack className="gap-1">
                    <Text className="text-sm">Ghi chú (nếu có)</Text>
                    <Textarea>
                      <TextareaInput
                        placeholder="Nhập ghi chú..."
                        value={formData.note}
                        onChangeText={(value) =>
                          handleInputChange("note", value)
                        }
                      />
                    </Textarea>
                  </VStack>
                </VStack>
              )}
            </Box>

            {/* Total and Continue */}
            <Box className="bg-white rounded-lg border border-gray-200 p-4">
              <HStack className="items-center justify-between mb-4">
                <Text className="font-semibold">Tổng tiền tạm tính:</Text>
                <Text className="text-xl font-bold text-red-600">
                  {formatPrice(total)}
                </Text>
              </HStack>
              <Button
                size="lg"
                className="bg-red-600"
                onPress={handleContinueToPayment}
              >
                <ButtonText>Tiếp tục</ButtonText>
              </Button>
            </Box>
          </VStack>
        )}

        {/* Step 2: Payment */}
        {currentStep === "payment" && (
          <VStack className="p-4 gap-4">
            {/* Voucher Selection */}
            <Box className="bg-white rounded-lg border border-gray-200 p-4">
              <HStack className="items-center gap-2 mb-4">
                <Icon as={TagIcon} size="sm" className="text-red-600" />
                <Text className="font-semibold text-gray-800">
                  CHỌN VOUCHER
                </Text>
              </HStack>

              <Pressable
                onPress={() => setShowVoucherModal(true)}
                className="border border-gray-300 rounded-lg p-3"
              >
                <HStack className="items-center justify-between">
                  <Text className="text-gray-700">
                    {selectedVoucher ? selectedVoucher.name : "Chọn voucher"}
                  </Text>
                  <Text className="text-gray-400">›</Text>
                </HStack>
              </Pressable>
            </Box>

            {/* Order Summary */}
            <Box className="bg-white rounded-lg border border-gray-200 p-4">
              <Text className="font-semibold mb-4 text-gray-800">
                CHI TIẾT ĐƠN HÀNG
              </Text>
              <VStack className="gap-3">
                <HStack className="justify-between">
                  <Text className="text-sm text-gray-600">
                    Số lượng sản phẩm
                  </Text>
                  <Text className="font-semibold">
                    {itemsToDisplay.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    )}
                  </Text>
                </HStack>

                <HStack className="justify-between">
                  <Text className="text-sm text-gray-600">Tổng tiền hàng</Text>
                  <Text className="font-semibold">
                    {formatPrice(
                      itemsToDisplay.reduce(
                        (total, item) => total + item.price * item.quantity,
                        0
                      )
                    )}
                  </Text>
                </HStack>

                <HStack className="justify-between">
                  <Text className="text-sm text-gray-600">Phí vận chuyển</Text>
                  <Text className="font-semibold text-green-600">Miễn phí</Text>
                </HStack>

                {rankDiscountAmount > 0 && (
                  <HStack className="justify-between">
                    <Text className="text-sm text-amber-700">
                      Chiết khấu {userProfile?.rank?.name}
                    </Text>
                    <Text className="font-semibold text-amber-700">
                      - {formatPrice(rankDiscountAmount)}
                    </Text>
                  </HStack>
                )}

                {voucherDiscountAmount > 0 && (
                  <HStack className="justify-between">
                    <Text className="text-sm text-red-600">
                      Voucher {selectedVoucher?.name}
                    </Text>
                    <Text className="font-semibold text-red-600">
                      - {formatPrice(voucherDiscountAmount)}
                    </Text>
                  </HStack>
                )}

                <Box className="h-px bg-gray-200" />

                <Box className="bg-red-50 -mx-4 px-4 py-3 rounded-lg">
                  <HStack className="justify-between items-center">
                    <VStack>
                      <Text className="font-bold text-gray-800">
                        Tổng thanh toán
                      </Text>
                      <Text className="text-xs text-gray-500">
                        Đã bao gồm VAT
                      </Text>
                    </VStack>
                    <Text className="text-2xl font-bold text-red-600">
                      {formatPrice(total)}
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            </Box>

            {/* Payment Method */}
            <Box className="bg-white rounded-lg border border-gray-200 p-4">
              <Text className="font-semibold mb-4 text-gray-800">
                PHƯƠNG THỨC THANH TOÁN
              </Text>
              <Pressable
                onPress={() => setShowPaymentModal(true)}
                className="border-2 border-gray-200 rounded-lg p-4"
              >
                <HStack className="items-center justify-between">
                  <HStack className="items-center gap-3">
                    <Box className="w-12 h-12 bg-white rounded-lg border border-gray-200 items-center justify-center p-1">
                      {formData.paymentMethod === "CASH_ON_DELIVERY" ? (
                        <Image
                          source={require("@/assets/images/COS.png")}
                          className="w-full h-full"
                          resizeMode="contain"
                        />
                      ) : formData.paymentMethod === "VN_PAY" ? (
                        <Image
                          source={require("@/assets/images/vnpay.png")}
                          className="w-full h-full"
                          resizeMode="contain"
                        />
                      ) : formData.paymentMethod === "PAY_OS" ? (
                        <Image
                          source={require("@/assets/images/payos.svg")}
                          className="w-full h-full"
                          resizeMode="contain"
                        />
                      ) : (
                        <Text className="text-2xl">💳</Text>
                      )}
                    </Box>
                    <VStack>
                      <Text className="font-semibold">
                        {formData.paymentMethod === "CASH_ON_DELIVERY"
                          ? "Thanh toán tại cửa hàng"
                          : formData.paymentMethod === "VN_PAY"
                          ? "VNPAY"
                          : formData.paymentMethod === "PAY_OS"
                          ? "PAYOS"
                          : "Chọn phương thức"}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        Nhấn để thay đổi
                      </Text>
                    </VStack>
                  </HStack>
                  <Text className="text-gray-400 text-2xl">›</Text>
                </HStack>
              </Pressable>
            </Box>

            {/* Delivery Info Summary */}
            <Box className="bg-white rounded-lg border border-gray-200 p-4">
              <Text className="font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-3">
                THÔNG TIN NHẬN HÀNG
              </Text>
              <VStack className="gap-3">
                <HStack className="justify-between">
                  <Text className="text-sm text-gray-600">Khách hàng</Text>
                  <Text className="font-semibold">
                    {userProfile?.fullName || "Khách hàng"}
                  </Text>
                </HStack>

                <HStack className="justify-between">
                  <Text className="text-sm text-gray-600">Email</Text>
                  <Text className="font-semibold">{formData.email}</Text>
                </HStack>

                {formData.isPickup ? (
                  <VStack className="gap-1">
                    <Text className="text-sm text-gray-600">Nhận hàng tại</Text>
                    <Text className="font-semibold">
                      Cửa hàng CellphoneS - 125 Trần Phú, Hải Châu, Đà Nẵng
                    </Text>
                  </VStack>
                ) : (
                  <>
                    <VStack className="gap-1">
                      <Text className="text-sm text-gray-600">
                        Địa chỉ nhận
                      </Text>
                      <Text className="font-semibold">
                        {getFullAddressString()}
                      </Text>
                    </VStack>
                    <HStack className="justify-between">
                      <Text className="text-sm text-gray-600">Người nhận</Text>
                      <Text className="font-semibold">
                        {formData.receiverName} - {formData.receiverPhone}
                      </Text>
                    </HStack>
                  </>
                )}
              </VStack>
            </Box>

            {/* Submit Button */}
            <Box className="bg-white rounded-lg border border-gray-200 p-4">
              <HStack className="justify-between items-center mb-4 bg-gray-50 p-3 rounded-lg">
                <Text className="font-bold text-gray-800">
                  Tổng tiền tạm tính
                </Text>
                <Text className="text-2xl font-bold text-red-600">
                  {formatPrice(total)}
                </Text>
              </HStack>

              <Button
                size="lg"
                className="bg-red-600"
                onPress={handleSubmit}
                isDisabled={isSubmitting}
              >
                {isSubmitting ? (
                  <HStack className="items-center gap-2">
                    <ActivityIndicator size="small" color="#fff" />
                    <ButtonText>Đang xử lý...</ButtonText>
                  </HStack>
                ) : (
                  <ButtonText>Xác nhận thanh toán</ButtonText>
                )}
              </Button>
            </Box>
          </VStack>
        )}
      </ScrollView>

      {/* Payment Method Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowPaymentModal(false)}
        >
          <Pressable
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-xl font-bold mb-4">
              Chọn phương thức thanh toán
            </Text>

            <VStack className="gap-3 mb-4">
              <Pressable
                onPress={() => {
                  handleInputChange("paymentMethod", "CASH_ON_DELIVERY");
                  setShowPaymentModal(false);
                }}
                className={`border-2 rounded-xl p-4 ${
                  formData.paymentMethod === "CASH_ON_DELIVERY"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200"
                }`}
              >
                <HStack className="items-center gap-3">
                  <Box className="w-14 h-14 bg-white rounded-lg border border-gray-200 items-center justify-center p-1">
                    <Image
                      source={require("@/assets/images/COS.png")}
                      className="w-full h-full"
                      resizeMode="contain"
                    />
                  </Box>
                  <VStack className="flex-1">
                    <Text className="font-bold">Thanh toán tại cửa hàng</Text>
                    <Text className="text-sm text-gray-600">
                      Thanh toán khi nhận hàng
                    </Text>
                  </VStack>
                  {formData.paymentMethod === "CASH_ON_DELIVERY" && (
                    <Icon as={CheckIcon} size="md" className="text-red-500" />
                  )}
                </HStack>
              </Pressable>

              <Pressable
                onPress={() => {
                  handleInputChange("paymentMethod", "VN_PAY");
                  setShowPaymentModal(false);
                }}
                className={`border-2 rounded-xl p-4 ${
                  formData.paymentMethod === "VN_PAY"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200"
                }`}
              >
                <HStack className="items-center gap-3">
                  <Box className="w-14 h-14 bg-white rounded-lg border border-gray-200 items-center justify-center p-1">
                    <Image
                      source={require("@/assets/images/vnpay.png")}
                      className="w-full h-full"
                      resizeMode="contain"
                    />
                  </Box>
                  <VStack className="flex-1">
                    <Text className="font-bold">VNPAY</Text>
                    <Text className="text-sm text-gray-600">
                      Thanh toán qua ví điện tử
                    </Text>
                  </VStack>
                  {formData.paymentMethod === "VN_PAY" && (
                    <Icon as={CheckIcon} size="md" className="text-red-500" />
                  )}
                </HStack>
              </Pressable>

              <Pressable
                onPress={() => {
                  handleInputChange("paymentMethod", "PAY_OS");
                  setShowPaymentModal(false);
                }}
                className={`border-2 rounded-xl p-4 ${
                  formData.paymentMethod === "PAY_OS"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200"
                }`}
              >
                <HStack className="items-center gap-3">
                  <Box className="w-14 h-14 bg-white rounded-lg border border-gray-200 items-center justify-center p-1">
                    <Image
                      source={require("@/assets/images/payos.svg")}
                      className="w-full h-full"
                      resizeMode="contain"
                    />
                  </Box>
                  <VStack className="flex-1">
                    <Text className="font-bold">PAYOS</Text>
                    <Text className="text-sm text-gray-600">
                      Thanh toán nhanh qua PAYOS
                    </Text>
                  </VStack>
                  {formData.paymentMethod === "PAY_OS" && (
                    <Icon as={CheckIcon} size="md" className="text-red-500" />
                  )}
                </HStack>
              </Pressable>
            </VStack>

            <Button onPress={() => setShowPaymentModal(false)}>
              <ButtonText>Đóng</ButtonText>
            </Button>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Voucher Selection Modal */}
      <Modal
        visible={showVoucherModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVoucherModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowVoucherModal(false)}
        >
          <Pressable
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80%]"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-xl font-bold mb-4">Chọn voucher</Text>

            <ScrollView className="mb-4" showsVerticalScrollIndicator={false}>
              {isLoadingVouchers ? (
                <Box className="py-12 items-center">
                  <ActivityIndicator size="large" color="#EF4444" />
                </Box>
              ) : availableVouchers.length === 0 ? (
                <Box className="py-12 items-center">
                  <Text className="text-gray-500">
                    Không có voucher khả dụng
                  </Text>
                </Box>
              ) : (
                <VStack className="gap-3">
                  {availableVouchers.map((voucher) => {
                    const isDisabled =
                      subtotalAfterRank < voucher.minOrderAmount;
                    const isSelected = selectedVoucher?.id === voucher.id;

                    return (
                      <Pressable
                        key={voucher.id}
                        onPress={() => {
                          if (!isDisabled) {
                            setSelectedVoucher(isSelected ? null : voucher);
                          }
                        }}
                        className={`p-4 border-2 rounded-xl ${
                          isDisabled
                            ? "opacity-50 border-gray-200 bg-gray-50"
                            : isSelected
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200"
                        }`}
                      >
                        <HStack className="items-start justify-between gap-3">
                          <VStack className="flex-1 gap-2">
                            <HStack className="items-center gap-2">
                              <Text className="font-bold">{voucher.name}</Text>
                              <Box className="bg-red-100 px-2 py-1 rounded">
                                <Text className="text-xs text-red-700 font-bold">
                                  -{voucher.discount}%
                                </Text>
                              </Box>
                            </HStack>
                            <Text className="text-xs text-gray-600">
                              {voucher.description}
                            </Text>
                            <HStack className="gap-2">
                              <Box className="bg-blue-50 px-2 py-1 rounded border border-blue-200">
                                <Text className="text-xs text-blue-700">
                                  Tối thiểu:{" "}
                                  {formatPrice(voucher.minOrderAmount)}
                                </Text>
                              </Box>
                              <Box className="bg-green-50 px-2 py-1 rounded border border-green-200">
                                <Text className="text-xs text-green-700">
                                  Giảm tối đa:{" "}
                                  {formatPrice(voucher.maxDiscountAmount)}
                                </Text>
                              </Box>
                            </HStack>
                            {isDisabled && (
                              <Text className="text-xs text-red-600">
                                ⚠️ Cần thêm{" "}
                                {formatPrice(
                                  voucher.minOrderAmount - subtotalAfterRank
                                )}{" "}
                                để áp dụng
                              </Text>
                            )}
                          </VStack>
                          {isSelected && (
                            <Icon
                              as={CheckIcon}
                              size="md"
                              className="text-red-500"
                            />
                          )}
                        </HStack>
                      </Pressable>
                    );
                  })}
                </VStack>
              )}
            </ScrollView>

            <Button onPress={() => setShowVoucherModal(false)}>
              <ButtonText>Đóng</ButtonText>
            </Button>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Address Selection Modal */}
      <Modal
        visible={showAddressModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddressModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowAddressModal(false)}
        >
          <Pressable
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80%]"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-xl font-bold mb-4">Chọn địa chỉ</Text>

            <ScrollView className="mb-4" showsVerticalScrollIndicator={false}>
              <VStack className="gap-3">
                {addresses.map((address) => (
                  <Pressable
                    key={address.id}
                    onPress={() => handleAddressSelect(address)}
                    className={`p-4 border-2 rounded-xl ${
                      formData.selectedAddressId === address.id
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200"
                    }`}
                  >
                    <HStack className="items-start justify-between gap-3">
                      <VStack className="flex-1 gap-1">
                        <HStack className="items-center gap-2">
                          <Text className="font-bold">{address.fullName}</Text>
                          {address.isDefault && (
                            <Box className="bg-green-100 px-2 py-1 rounded">
                              <Text className="text-xs text-green-700 font-bold">
                                Mặc định
                              </Text>
                            </Box>
                          )}
                        </HStack>
                        <Text className="text-sm text-gray-600">
                          {address.phone}
                        </Text>
                        <Text className="text-sm text-gray-700">
                          {address.fullAddress ||
                            `${address.subAddress}, ${address.wardName}, ${address.provinceName}`}
                        </Text>
                      </VStack>
                      {formData.selectedAddressId === address.id && (
                        <Icon
                          as={CheckIcon}
                          size="md"
                          className="text-red-500"
                        />
                      )}
                    </HStack>
                  </Pressable>
                ))}
              </VStack>
            </ScrollView>

            <Button onPress={() => setShowAddressModal(false)}>
              <ButtonText>Đóng</ButtonText>
            </Button>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Province Selection Modal */}
      <Modal
        visible={showProvinceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProvinceModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowProvinceModal(false)}
        >
          <Pressable
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80%]"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-xl font-bold mb-4">Chọn Tỉnh/Thành phố</Text>

            <ScrollView className="mb-4" showsVerticalScrollIndicator={false}>
              <VStack className="gap-2">
                {provinces.map((province) => (
                  <Pressable
                    key={province.id}
                    onPress={() => handleProvinceSelect(province.id)}
                    className={`p-4 border rounded-lg ${
                      formData.provinceId === province.id
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200"
                    }`}
                  >
                    <HStack className="items-center justify-between">
                      <Text className="font-medium">{province.name}</Text>
                      {formData.provinceId === province.id && (
                        <Icon
                          as={CheckIcon}
                          size="sm"
                          className="text-red-500"
                        />
                      )}
                    </HStack>
                  </Pressable>
                ))}
              </VStack>
            </ScrollView>

            <Button onPress={() => setShowProvinceModal(false)}>
              <ButtonText>Đóng</ButtonText>
            </Button>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Ward Selection Modal */}
      <Modal
        visible={showWardModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWardModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowWardModal(false)}
        >
          <Pressable
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80%]"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-xl font-bold mb-4">Chọn Phường/Xã</Text>

            <ScrollView className="mb-4" showsVerticalScrollIndicator={false}>
              {wards.length === 0 ? (
                <Box className="py-12 items-center">
                  <Text className="text-gray-500">
                    Vui lòng chọn tỉnh/thành phố trước
                  </Text>
                </Box>
              ) : (
                <VStack className="gap-2">
                  {wards.map((ward) => (
                    <Pressable
                      key={ward.id}
                      onPress={() => handleWardSelect(ward.id)}
                      className={`p-4 border rounded-lg ${
                        formData.wardId === ward.id
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200"
                      }`}
                    >
                      <HStack className="items-center justify-between">
                        <Text className="font-medium">{ward.name}</Text>
                        {formData.wardId === ward.id && (
                          <Icon
                            as={CheckIcon}
                            size="sm"
                            className="text-red-500"
                          />
                        )}
                      </HStack>
                    </Pressable>
                  ))}
                </VStack>
              )}
            </ScrollView>

            <Button onPress={() => setShowWardModal(false)}>
              <ButtonText>Đóng</ButtonText>
            </Button>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
