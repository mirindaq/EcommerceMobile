// src/components/admin/customer/CustomerForm.tsx
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Calendar as CalendarIcon,
  Camera,
  Loader2,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type {
  CustomerSummary,
  CreateCustomerRequest,
  UpdateCustomerProfileRequest,
  AddressRequest,
  AddressResponse,
} from "@/types/customer.type";
import { customerService } from "@/services/customer.service";
import { provinceService } from "@/services/province.service";
import AddressFields from "./AddressFields";

interface AddressFormData {
  id: number;
  customerId?: number;
  subAddress: string;
  wardCode: string;
  provinceCode: string;
  fullName: string;
  phone: string;
  isDefault: boolean;
  addressName: string;
}

const getInitialFormData = (customer: CustomerSummary | null) => {
  if (customer) {
    return {
      fullName: customer.fullName ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      dateOfBirth: customer.dateOfBirth ? new Date(customer.dateOfBirth) : null,
      avatar: customer.avatar ?? "",
      password: "",
    };
  }
  return {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    dateOfBirth: null,
    avatar: "",
  };
};

const getNewAddress = (
  index: number,
  name: string,
  phone: string
): AddressFormData => ({
  id: index,
  subAddress: "",
  wardCode: "",
  provinceCode: "",
  fullName: name,
  phone: phone,
  isDefault: index === 0,
  addressName: index === 0 ? "Địa chỉ mặc định" : "",
});

// --- Sửa chỗ map: giữ id thực từ backend (rawAddr.id) nếu có
const mapAddressResponseToFormData = (
  addr: AddressResponse,
  index: number
): AddressFormData => {
  const rawAddr = addr as any;
  // lấy id thật từ raw nếu backend trả id, fallback về addr.id (nếu có), cuối cùng là index
  const realId = rawAddr.id ?? (addr as any).id ?? index;
  const customerId =
    rawAddr.customerId ??
    rawAddr.customer_id ??
    rawAddr.customer?.id ??
    undefined;

  return {
    id: realId,
    subAddress: addr.subAddress || "",
    // preserve codes/names; try common fields
    wardCode:
      (addr as any).ward?.code ||
      rawAddr.wardCode ||
      rawAddr.ward_code ||
      rawAddr.wardName ||
      "",
    provinceCode:
      (addr as any).province?.code ||
      rawAddr.provinceCode ||
      rawAddr.province_code ||
      rawAddr.provinceName ||
      "",
    fullName: addr.fullName || "",
    phone: addr.phone || "",
    isDefault: (addr as any).isDefault || false,
    addressName: (addr as any).addressName || "",
    customerId,
  };
};

interface CustomerFormProps {
  customer: CustomerSummary | null;
  onSubmit: (
    data: CreateCustomerRequest | UpdateCustomerProfileRequest
  ) => Promise<void>;
  onFinished: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function CustomerForm({
  customer,
  onFinished,
  onCancel,
  isLoading,
}: CustomerFormProps) {
  const [formData, setFormData] = useState(() => getInitialFormData(customer));
  const [preview, setPreview] = useState(() => customer?.avatar || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(1);
  const [createdCustomer, setCreatedCustomer] =
    useState<CustomerSummary | null>(customer);
  // 🧩 Lưu danh sách ID địa chỉ bị xoá (chờ đến khi cập nhật mới xoá DB)
  const [deletedAddressIds, setDeletedAddressIds] = useState<number[]>([]);

  // keep addresses initial mapped from customer.addresses if any
  const [addresses, setAddresses] = useState<AddressFormData[]>(() => {
    if (customer && customer.addresses && customer.addresses.length > 0) {
      return customer.addresses.map((addr, idx) => ({
        ...mapAddressResponseToFormData(addr, idx),
        // nếu backend trả customer id thì map đã gán; vẫn gán lại để chắc chắn
        customerId: customer.id,
      }));
    }
    if (customer) {
      return [getNewAddress(0, customer.fullName || "", customer.phone || "")];
    }
    return [getNewAddress(0, "", "")];
  });

  const [provinces, setProvinces] = useState<any[]>([]);
  const [wardsByProvince, setWardsByProvince] = useState<Record<string, any[]>>(
    {}
  );

  const nextAddressId = useMemo(
    () => (addresses.length ? addresses[addresses.length - 1].id + 1 : 0),
    [addresses]
  );

  const normalize = (s?: string) =>
    !s
      ? ""
      : s
          .normalize?.("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .trim();

  useEffect(() => {
    if (step === 2 || customer) {
      const fetchProvinces = async () => {
        try {
          const data = await provinceService.getAllProvinces();
          setProvinces(data || []);
        } catch (err) {
          console.error("fetchProvinces error:", err);
          toast.error("Không tải được danh sách tỉnh/thành");
        }
      };
      fetchProvinces();
    }
  }, [step, customer]);

  useEffect(() => {
    if (!customer) return;
    if (!provinces.length) return;

    const rawAddrs = (customer.addresses || []) as any[];
    const newAddresses = addresses.map((addr, idx) => {
      const raw = rawAddrs[idx] || {};
      let provinceCode = addr.provinceCode || "";
      let wardCode = addr.wardCode || "";

      const candidateProvince =
        raw.province?.code ||
        raw.provinceCode ||
        raw.province_code ||
        raw.provinceName ||
        raw.province_name ||
        "";
      const candidateWard =
        raw.ward?.code ||
        raw.wardCode ||
        raw.ward_code ||
        raw.wardName ||
        raw.ward_name ||
        "";

      if (candidateProvince) {
        const byCode = provinces.find((p) => p.code === candidateProvince);
        if (byCode) {
          provinceCode = byCode.code;
        } else {
          const byName = provinces.find(
            (p) =>
              normalize(p.name) === normalize(candidateProvince) ||
              normalize(p.name) === normalize(raw.provinceName)
          );
          if (byName) provinceCode = byName.code;
        }
      }

      if (!provinceCode && raw.provinceName) {
        const byName = provinces.find(
          (p) => normalize(p.name) === normalize(raw.provinceName)
        );
        if (byName) provinceCode = byName.code;
      }

      if (candidateWard) {
        wardCode =
          candidateWard && candidateWard.length > 0 ? candidateWard : "";
      }

      return {
        ...addr,
        provinceCode: provinceCode || "",
        wardCode: wardCode || "",
      };
    });

    setAddresses(newAddresses);

    const codesToFetch = Array.from(
      new Set(
        newAddresses
          .map((a) => a.provinceCode)
          .filter((c) => !!c && !wardsByProvince[c])
      )
    );

    if (codesToFetch.length === 0) return;

    const fetchWardsAndMap = async () => {
      const newWardsMap: Record<string, any[]> = {};
      for (const code of codesToFetch) {
        try {
          const w = await provinceService.getWardsByProvince(Number(code));
          newWardsMap[code] = w || [];
        } catch (err) {
          console.error("fetch ward error", err);
          newWardsMap[code] = [];
        }
      }

      setWardsByProvince((prev) => ({ ...prev, ...newWardsMap }));

      setAddresses((prevAddrs) =>
        prevAddrs.map((addr, idx) => {
          if (addr.wardCode) {
            const list =
              newWardsMap[addr.provinceCode] ||
              wardsByProvince[addr.provinceCode] ||
              [];
            const foundByCode = list.find((w: any) => w.code === addr.wardCode);
            if (foundByCode) return addr;
          }
          const raw = rawAddrs[idx] || {};
          const wardNameCandidate =
            raw.wardName || raw.ward_name || raw.ward?.name || "";
          const list =
            newWardsMap[addr.provinceCode] ||
            wardsByProvince[addr.provinceCode] ||
            [];
          if (wardNameCandidate) {
            const found = list.find(
              (w: any) => normalize(w.name) === normalize(wardNameCandidate)
            );
            if (found) {
              return { ...addr, wardCode: found.code || "" };
            }
          }
          if (addr.wardCode) {
            const found2 = list.find(
              (w: any) => normalize(w.name) === normalize(addr.wardCode)
            );
            if (found2) return { ...addr, wardCode: found2.code || "" };
          }
          return addr;
        })
      );
    };

    fetchWardsAndMap();
  }, [customer, provinces]); // run when provinces available

  const handleValueChange = (field: string, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleAddressChange = (
    index: number,
    field: keyof AddressFormData,
    value: any
  ) => {
    setAddresses((prev) =>
      prev.map((addr, i) => {
        if (field === "isDefault" && value) {
          return { ...addr, isDefault: i === index }; // chỉ index này true
        }
        if (i === index) {
          return { ...addr, [field]: value };
        }
        return addr;
      })
    );
  };

  const handleProvinceChange = async (index: number, provinceCode: string) => {
    handleAddressChange(index, "provinceCode", provinceCode);
    handleAddressChange(index, "wardCode", "");

    if (provinceCode && !wardsByProvince[provinceCode]) {
      try {
        const data = await provinceService.getWardsByProvince(
          Number(provinceCode)
        );
        setWardsByProvince((prev) => ({ ...prev, [provinceCode]: data }));
      } catch {
        toast.error("Không tải được danh sách phường/xã");
      }
    }
  };
  const handleRemoveAddress = (index: number) => {
    const addrToRemove = addresses[index];
    if (addrToRemove.id && addrToRemove.customerId) {
      setDeletedAddressIds((prev) => [...prev, addrToRemove.id]);
    }
    setAddresses((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        toast.error("Họ và tên không được để trống");
        return false;
      }
      if (!formData.email.trim()) {
        toast.error("Email không được để trống");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Email không đúng định dạng");
        return false;
      }
      if (!formData.phone.trim()) {
        toast.error("Số điện thoại không được để trống");
        return false;
      }
      if (!customer && !formData.password.trim()) {
        toast.error("Mật khẩu không được để trống");
        return false;
      }
      if (!/^[0-9]{10}$/.test(formData.phone)) {
        toast.error("Số điện thoại phải gồm 10 chữ số");
        return false;
      }
      return true;
    }
    if (currentStep === 2) {
      if (!addresses.length) {
        toast.error("Vui lòng thêm ít nhất một địa chỉ");
        return false;
      }
      let valid = true;
      addresses.forEach((addr, idx) => {
        if (!addr.subAddress.trim()) {
          toast.error(`Địa chỉ ${idx + 1}: chi tiết không được để trống`);
          valid = false;
        }
        if (!addr.wardCode.trim()) {
          toast.error(`Địa chỉ ${idx + 1}: chọn phường/xã`);
          valid = false;
        }
        if (!addr.provinceCode.trim()) {
          toast.error(`Địa chỉ ${idx + 1}: chọn tỉnh/thành`);
          valid = false;
        }
        if (!addr.fullName.trim()) {
          toast.error(`Địa chỉ ${idx + 1}: tên người nhận không được để trống`);
          valid = false;
        }
        if (!/^[0-9]{10}$/.test(addr.phone)) {
          toast.error(`Địa chỉ ${idx + 1}: SĐT không hợp lệ`);
          valid = false;
        }
      });
      if (valid && !addresses.some((addr) => addr.isDefault)) {
        toast.error("Chọn ít nhất 1 địa chỉ mặc định");
        valid = false;
      }
      return valid;
    }
    return true;
  };

  const handleStep1Submit = async () => {
    if (customer) return;
    if (!validateStep(1)) return;
    setIsUploading(true);
    try {
      let finalAvatar = preview || "/assets/avatar.jpg";
      if (selectedFile) {
        await new Promise((r) => setTimeout(r, 500));
        toast.success("Upload avatar thành công (mô phỏng)");
      }
      const dob = formData.dateOfBirth
        ? format(formData.dateOfBirth, "yyyy-MM-dd")
        : null;
      const payload: CreateCustomerRequest = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password!,
        avatar: finalAvatar,
        dateOfBirth: dob,
        addresses: [],
      };
      const newCustomer = await customerService.createCustomer(payload);
      setCreatedCustomer(newCustomer.data);
      toast.success("Khách hàng tạo thành công. Tiếp tục thêm địa chỉ.");
      setStep(2);
    } catch (error) {
      console.error(error);
      toast.error("Thao tác thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer && step === 1) return handleStep1Submit();

    // Kiểm tra step 1 và step 2
    if (!validateStep(1)) return;
    if (!validateStep(2)) return;

    setIsUploading(true);
    try {
      const targetCustomer = customer || createdCustomer;

      if (!targetCustomer) throw new Error("Customer chưa được tạo");

      // 1. Xoá địa chỉ
      for (const id of deletedAddressIds) {
        await customerService.deleteAddressForCustomer(targetCustomer.id, id);
      }

      // 2. Duyệt địa chỉ: phân biệt mới/cũ
      for (const addr of addresses) {
        const req: AddressRequest = {
          subAddress: addr.subAddress,
          wardCode: addr.wardCode,
          provinceCode: addr.provinceCode,
          fullName: addr.fullName,
          phone: addr.phone,
          isDefault: addr.isDefault,
          addressName: addr.addressName,
        };

        if (addr.id && addr.customerId) {
          // Cập nhật địa chỉ cũ
          await customerService.updateAddress(targetCustomer.id, addr.id, req);
        } else {
          // Tạo mới
          await customerService.createAddressForCustomer(
            targetCustomer.id,
            req
          );
        }
      }

      toast.success("Cập nhật địa chỉ thành công");
      onFinished();
    } catch (err) {
      console.error(err);
      toast.error("Thao tác thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddAddress = () =>
    setAddresses((prev) => [
      ...prev,
      getNewAddress(nextAddressId, formData.fullName, formData.phone),
    ]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(step === 1 || customer) && (
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={preview || "/assets/avatar.jpg"}
                alt="avatar"
                className="h-28 w-28 rounded-full object-cover border"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-gray-800 p-2 rounded-full cursor-pointer hover:bg-gray-700"
              >
                <Camera className="h-4 w-4 text-white" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Họ và tên *</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => handleValueChange("fullName", e.target.value)}
              />
            </div>
            <div>
              <Label>SĐT *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleValueChange("phone", e.target.value)}
              />
            </div>
            {!customer && (
              <>
                <div>
                  <Label>Email *</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => handleValueChange("email", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Mật khẩu *</Label>
                  <Input
                    type="password"
                    onChange={(e) =>
                      handleValueChange("password", e.target.value)
                    }
                  />
                </div>
              </>
            )}
            <div>
              <Label>Ngày sinh</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateOfBirth
                      ? format(formData.dateOfBirth, "dd/MM/yyyy")
                      : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dateOfBirth || undefined}
                    onSelect={(date) => handleValueChange("dateOfBirth", date)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      )}

      {(step === 2 || customer) && (
        <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4 custom-scroll">
          <div className={`space-y-6 ${customer ? "border-t pt-6 mt-6" : ""}`}>
            <h3 className="text-lg font-semibold">Quản lý địa chỉ</h3>
            <div className="flex flex-col gap-4">
              {addresses.map((addr, idx) => (
                <AddressFields
                  key={addr.id}
                  address={addr}
                  index={idx}
                  provinces={provinces}
                  wards={wardsByProvince[addr.provinceCode] || []}
                  onProvinceChange={(code) => handleProvinceChange(idx, code)}
                  onAddressChange={handleAddressChange}
                  onRemove={handleRemoveAddress}
                  isRemovable={addresses.length > 1}
                  isNewCustomer={!customer}
                />
              ))}
            </div>
            <Button type="button" onClick={handleAddAddress} variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Thêm địa chỉ
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t">
        {step === 2 && !customer && (
          <Button type="button" variant="outline" onClick={() => setStep(1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        )}
        <div className="flex-1 flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={isUploading || isLoading}>
            {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {customer
              ? "Cập nhật"
              : step === 2
              ? "Hoàn tất & Thêm địa chỉ"
              : "Tiếp theo"}
          </Button>
        </div>
      </div>
    </form>
  );
}
