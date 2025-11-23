// src/types/address.type.ts
import type { ResponseApi } from './responseApi.type'

export type Address = {
  id: number
  fullName: string
  phone: string
  subAddress: string
  isDefault: boolean
  wardId: number
  wardName?: string
  provinceId: number
  provinceName?: string
  fullAddress?: string
}

export type CreateAddressRequest = {
  subAddress: string
  wardId: number
  fullName: string
  phone: string
  isDefault?: boolean
}

export type AddressResponse = ResponseApi<Address>
export type AddressListResponse = ResponseApi<Address[]>