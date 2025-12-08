import React, { useState, useEffect } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import { verifyUserAPI } from '~/apis'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'

export default function AccountVerification() {
  // Lấy giá trị email và token từ URL
  const [searchParams] = useSearchParams()
  const { email, token } = Object.fromEntries([...searchParams])

  // Tạo state để biết tài khoản đã verify xong chưa
  const [verified, setVerified] = useState(false)

  // Giả lập gọi API verify tài khoản
useEffect (() =>{
  if (email && token) {
    verifyUserAPI({email, token}).then(()=>
      setVerified(true))
    }
  }, [email, token])
  // Nếu thiếu email hoặc token → chuyển về 404
  if (!email || !token) {
    return <Navigate to="/404" />
  }

  // Nếu chưa verify xong → hiển thị loading
  if (!verified) {
    return <PageLoadingSpinner caption="Verifying your account..." />
  }

  // Khi verify thành công → chuyển sang trang login
  return <Navigate to={`/login?verifiedEmail=${email}`} />
}
