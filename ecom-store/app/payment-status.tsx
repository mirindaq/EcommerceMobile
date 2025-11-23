import {
  Box,
  Button,
  ButtonText,
  HStack,
  SafeAreaView,
  ScrollView,
  Text,
  VStack,
} from "@/components/ui";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CheckCircle,
  XCircle,
  Home,
  Package,
  ArrowLeft,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

export default function PaymentStatusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [countdown, setCountdown] = useState(10);

  // Lấy thông tin từ URL params
  const vnpResponseCode = params.vnp_ResponseCode as string;
  const orderId = params.orderId as string;
  const vnpTransactionNo = params.vnp_TransactionNo as string;
  const vnpTxnRef = params.vnp_TxnRef as string;
  const vnpAmount = params.vnp_Amount as string;
  const vnpBankCode = params.vnp_BankCode as string;
  const vnpPayDate = params.vnp_PayDate as string;

  // Check xem thanh toán thành công hay thất bại
  const isSuccess = vnpResponseCode === "00";

  // Format số tiền
  const formatAmount = (amount: string) => {
    if (!amount) return "0 ₫";
    const amountNumber = parseInt(amount) / 100;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amountNumber);
  };

  // Format ngày giờ thanh toán
  const formatPayDate = (dateStr: string) => {
    if (!dateStr) return "";
    // Format: YYYYMMDDHHmmss -> DD/MM/YYYY HH:mm:ss
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);
    const second = dateStr.substring(12, 14);
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  // Get error message
  const getErrorMessage = (code: string) => {
    switch (code) {
      case "24":
        return "Giao dịch bị hủy";
      case "07":
        return "Trừ tiền thành công nhưng giao dịch bị nghi ngờ";
      case "09":
        return "Giao dịch không thành công do thẻ chưa đăng ký dịch vụ";
      case "10":
        return "Giao dịch không thành công do xác thực thông tin thẻ sai quá số lần quy định";
      case "11":
        return "Giao dịch không thành công do đã hết hạn chờ thanh toán";
      case "12":
        return "Giao dịch không thành công do thẻ bị khóa";
      case "13":
        return "Giao dịch không thành công do nhập sai mật khẩu xác thực giao dịch (OTP)";
      case "51":
        return "Tài khoản không đủ số dư";
      case "65":
        return "Tài khoản vượt quá hạn mức giao dịch trong ngày";
      default:
        return "Lỗi không xác định";
    }
  };

  // Auto redirect về trang chủ sau 10 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.replace("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <Box className="p-6">
          {/* Icon và Title */}
          <VStack className="items-center mb-8 mt-8">
            {isSuccess ? (
              <Box className="mb-6">
                <CheckCircle size={96} color="#22c55e" strokeWidth={2} />
              </Box>
            ) : (
              <Box className="mb-6">
                <XCircle size={96} color="#ef4444" strokeWidth={2} />
              </Box>
            )}

            <Text
              className={`text-3xl font-bold mb-2 text-center ${
                isSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại!"}
            </Text>
            <Text className="text-gray-600 text-center px-4">
              {isSuccess
                ? "Đơn hàng của bạn đã được xác nhận và đang được xử lý"
                : "Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác"}
            </Text>
          </VStack>

          {/* Thông tin giao dịch */}
          <Box className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <Text className="font-bold text-lg text-gray-800 mb-4 pb-3 border-b border-gray-200">
              Thông tin giao dịch
            </Text>

            {orderId && (
              <HStack className="justify-between items-center py-3">
                <Text className="text-gray-600 font-medium">Mã đơn hàng:</Text>
                <Text className="font-bold text-gray-900">#{orderId}</Text>
              </HStack>
            )}

            {vnpAmount && (
              <HStack className="justify-between items-center py-3">
                <Text className="text-gray-600 font-medium">Số tiền:</Text>
                <Text className="font-bold text-lg text-red-600">
                  {formatAmount(vnpAmount)}
                </Text>
              </HStack>
            )}

            {vnpTransactionNo && (
              <HStack className="justify-between items-center py-3">
                <Text className="text-gray-600 font-medium">Mã giao dịch:</Text>
                <Text className="font-mono text-sm text-gray-900">
                  {vnpTransactionNo}
                </Text>
              </HStack>
            )}

            {vnpTxnRef && (
              <HStack className="justify-between items-center py-3">
                <Text className="text-gray-600 font-medium">
                  Mã tham chiếu:
                </Text>
                <Text className="font-mono text-sm text-gray-900">
                  {vnpTxnRef}
                </Text>
              </HStack>
            )}

            {vnpBankCode && (
              <HStack className="justify-between items-center py-3">
                <Text className="text-gray-600 font-medium">Ngân hàng:</Text>
                <Text className="font-semibold text-gray-900 uppercase">
                  {vnpBankCode}
                </Text>
              </HStack>
            )}

            {vnpPayDate && (
              <HStack className="justify-between items-center py-3">
                <Text className="text-gray-600 font-medium">
                  Thời gian thanh toán:
                </Text>
                <Text className="text-gray-900">
                  {formatPayDate(vnpPayDate)}
                </Text>
              </HStack>
            )}

            <HStack className="justify-between items-center py-3 pt-4 border-t border-gray-200">
              <Text className="text-gray-600 font-medium">Trạng thái:</Text>
              <Box
                className={`px-4 py-2 rounded-full ${
                  isSuccess ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <Text
                  className={`font-bold text-sm ${
                    isSuccess ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {isSuccess ? "Thành công" : "Thất bại"}
                </Text>
              </Box>
            </HStack>
          </Box>

          {/* Message box */}
          {isSuccess ? (
            <Box className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
              <Text className="text-green-800 text-sm leading-relaxed">
                ✅ Cảm ơn bạn đã mua sắm! Chúng tôi sẽ xử lý đơn hàng của bạn
                trong thời gian sớm nhất. Bạn có thể kiểm tra trạng thái đơn
                hàng trong phần "Lịch sử đơn hàng".
              </Text>
            </Box>
          ) : (
            <Box className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <Text className="text-red-800 text-sm leading-relaxed mb-2">
                ❌ Giao dịch không thành công do:{" "}
                <Text className="font-bold">
                  {getErrorMessage(vnpResponseCode)}
                </Text>
              </Text>
              <Text className="text-red-700 text-xs">
                Vui lòng thử lại hoặc liên hệ hotline{" "}
                <Text className="font-semibold">1800.2097</Text> để được hỗ trợ.
              </Text>
            </Box>
          )}

          {/* Action Buttons */}
          <VStack className="gap-3">
            <Button
              onPress={() => router.replace("/")}
              className="h-14 bg-white border-2 border-gray-300"
            >
              <HStack className="items-center gap-2">
                <Home size={20} color="#000" />
                <ButtonText className="text-base font-semibold text-gray-900">
                  Về trang chủ
                </ButtonText>
              </HStack>
            </Button>

            {isSuccess && orderId && (
              <Button
                onPress={() =>
                  router.replace("/(tabs)/(profile)/order-history")
                }
                className="h-14 bg-red-600"
              >
                <HStack className="items-center gap-2">
                  <Package size={20} color="#fff" />
                  <ButtonText className="text-base font-semibold">
                    Xem đơn hàng
                  </ButtonText>
                </HStack>
              </Button>
            )}

            {!isSuccess && (
              <Button
                onPress={() => router.replace("/cart")}
                className="h-14 bg-red-600"
              >
                <ButtonText className="text-base font-semibold">
                  Thử lại
                </ButtonText>
              </Button>
            )}
          </VStack>

          {/* Auto redirect countdown */}
          <Box className="mt-6 pt-6 border-t border-gray-200">
            <Text className="text-sm text-gray-500 text-center">
              Tự động chuyển về trang chủ sau{" "}
              <Text className="font-bold text-red-600">{countdown}</Text> giây
            </Text>
          </Box>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
