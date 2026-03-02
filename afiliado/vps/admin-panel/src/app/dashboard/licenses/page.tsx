'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Plus, Search, Eye, Ban, CheckCircle, RotateCcw } from 'lucide-react'

interface License {
    id: string
    license_key: string
    user_phone: string
    user_name: string
    plan_name: string
    status: string
    expiration_date: string
    quota_used: number
    machine_count: number
    created_at: string
}

export default function LicensesPage() {
    const [licenses, setLicenses] = useS