# 📡 **SIRAMA - API Documentation**

Dokumentasi lengkap API endpoints untuk sistem SIRAMA dengan spesifikasi OpenAPI 3.0.

## 🔐 **Authentication**

### **Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@hospital.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Dr. Ahmad",
      "email": "ahmad@hospital.com",
      "role": "dokter"
    },
    "token": "bearer_token_here",
    "expires_in": 3600
  }
}
```

### **Logout**
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

### **Refresh Token**
```http
POST /api/auth/refresh
Authorization: Bearer {token}
```

---

## 👥 **User Management**

### **Get Current User**
```http
GET /api/auth/me
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Dr. Ahmad",
    "email": "ahmad@hospital.com",
    "role": "dokter",
    "permissions": ["read_patient", "write_prescription"]
  }
}
```

### **List Users** (Admin Only)
```http
GET /api/users
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 15)
- `role` - Filter by role
- `search` - Search by name or email

### **Create User** (Admin Only)
```http
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Dr. Siti",
  "email": "siti@hospital.com",
  "password": "password123",
  "role": "dokter",
  "department": "Poli Dalam"
}
```

### **Update User** (Admin Only)
```http
PUT /api/users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Dr. Siti Aminah",
  "role": "dokter",
  "department": "Poli Anak"
}
```

### **Delete User** (Admin Only)
```http
DELETE /api/users/{id}
Authorization: Bearer {token}
```

---

## 🏥 **Patient Management**

### **List Patients**
```http
GET /api/patients
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`, `per_page`
- `search` - Search by name or MRN
- `status` - active/inactive
- `registration_date_from`, `registration_date_to`

### **Get Patient Details**
```http
GET /api/patients/{id}
Authorization: Bearer {token}
```

### **Create Patient**
```http
POST /api/patients
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Ahmad Susanto",
  "nik": "1234567890123456",
  "birth_date": "1990-05-15",
  "gender": "L",
  "phone": "081234567890",
  "address": "Jl. Merdeka No. 123",
  "emergency_contact": "081987654321"
}
```

### **Update Patient**
```http
PUT /api/patients/{id}
Authorization: Bearer {token}
```

### **Patient Registration**
```http
POST /api/patients/{id}/register
Authorization: Bearer {token}
Content-Type: application/json

{
  "service_unit": "Poli Penyakit Dalam",
  "doctor_id": 5,
  "arrival_type": "mandiri",
  "payment_method": "bpjs",
  "bpjs_number": "000123456789"
}
```

---

## 📋 **Registration & Queue Management**

### **List Registrations**
```http
GET /api/registrations
Authorization: Bearer {token}
```

**Query Parameters:**
- `date` - Filter by date
- `status` - registered/checked-in/completed/cancelled
- `service_unit` - Filter by poli/unit

### **Create Registration**
```http
POST /api/registrations
Authorization: Bearer {token}
Content-Type: application/json

{
  "patient_id": 123,
  "service_unit": "Poli Penyakit Dalam",
  "doctor_id": 5,
  "arrival_type": "mandiri",
  "payment_method": "bpjs",
  "bpjs_sep": "123456789"
}
```

### **Update Registration Status**
```http
PUT /api/registrations/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "checked-in",
  "notes": "Patient sudah check-in"
}
```

### **Generate Queue Number**
```http
POST /api/queue/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "registration_id": 456,
  "service_unit": "Poli Penyakit Dalam"
}
```

---

## 🩺 **Medical Records (EMR)**

### **List Medical Records**
```http
GET /api/emr
Authorization: Bearer {token}
```

**Query Parameters:**
- `patient_id` - Filter by patient
- `date_from`, `date_to`
- `doctor_id`

### **Get EMR Details**
```http
GET /api/emr/{id}
Authorization: Bearer {token}
```

### **Create EMR**
```http
POST /api/emr
Authorization: Bearer {token}
Content-Type: application/json

{
  "patient_id": 123,
  "registration_id": 456,
  "chief_complaint": "Demam dan batuk",
  "history": "Demam sejak 3 hari yang lalu",
  "physical_exam": "T: 38.5°C, RR: 20x/menit",
  "diagnosis": "ISPA - Upper Respiratory Tract Infection",
  "icd_code": "J06.9",
  "treatment_plan": "Paracetamol 500mg 3x1, istirahat cukup",
  "prescription": [
    {
      "medicine": "Paracetamol 500mg",
      "dose": "1 tablet",
      "frequency": "3x sehari",
      "duration": "5 hari"
    }
  ]
}
```

### **Add Vital Signs (TTV)**
```http
POST /api/emr/{id}/vital-signs
Authorization: Bearer {token}
Content-Type: application/json

{
  "blood_pressure": "120/80",
  "heart_rate": 80,
  "temperature": 36.8,
  "respiratory_rate": 16,
  "oxygen_saturation": 98
}
```

### **Add Progress Notes (CPPT)**
```http
POST /api/emr/{id}/cppt
Authorization: Bearer {token}
Content-Type: application/json

{
  "subjective": "Pasien mengeluh demam berkurang",
  "objective": "T: 37.2°C, tensi stabil",
  "assessment": "Infeksi saluran pernapasan atas membaik",
  "plan": "Lanjutkan terapi, kontrol besok"
}
```

---

## 🔬 **Laboratory Management**

### **List Lab Orders**
```http
GET /api/laboratory/orders
Authorization: Bearer {token}
```

### **Create Lab Order**
```http
POST /api/laboratory/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "patient_id": 123,
  "emr_id": 456,
  "tests": [
    {
      "test_code": "CBC",
      "test_name": "Complete Blood Count",
      "priority": "routine"
    },
    {
      "test_code": "URINE",
      "test_name": "Urinalysis",
      "priority": "urgent"
    }
  ],
  "clinical_info": "Suspected infection",
  "priority": "urgent"
}
```

### **Update Lab Results**
```http
PUT /api/laboratory/results/{order_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "results": [
    {
      "test_code": "CBC",
      "parameter": "Hemoglobin",
      "value": "12.5",
      "unit": "g/dL",
      "reference": "12-16",
      "status": "normal"
    }
  ],
  "conclusion": "Hasil dalam batas normal",
  "validated_by": "Dr. Lab Technician"
}
```

---

## 📸 **Radiology Management**

### **List Radiology Orders**
```http
GET /api/radiology/orders
Authorization: Bearer {token}
```

### **Create Radiology Order**
```http
POST /api/radiology/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "patient_id": 123,
  "emr_id": 456,
  "modality": "X-Ray",
  "body_part": "Thorax PA",
  "clinical_info": "Suspected pneumonia",
  "priority": "urgent"
}
```

### **Upload Radiology Result**
```http
POST /api/radiology/results/{order_id}
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "images": [file1.jpg, file2.jpg],
  "findings": "Infiltrate pada lobus bawah kanan",
  "impression": "Suspect pneumonia",
  "recommendation": "Konsultasi ke poli paru"
}
```

---

## 💊 **Pharmacy Management**

### **List Prescriptions**
```http
GET /api/pharmacy/prescriptions
Authorization: Bearer {token}
```

### **Validate Prescription**
```http
POST /api/pharmacy/prescriptions/{id}/validate
Authorization: Bearer {token}
Content-Type: application/json

{
  "validated_by": "Apt. Siti",
  "notes": "Resep valid, stok tersedia"
}
```

### **Dispense Medication**
```http
POST /api/pharmacy/dispensing
Authorization: Bearer {token}
Content-Type: application/json

{
  "prescription_id": 789,
  "medications": [
    {
      "medicine_id": 123,
      "quantity": 10,
      "instructions": "3x1 tablet setelah makan"
    }
  ],
  "dispensed_by": "Apt. Ahmad"
}
```

### **Inventory Management**
```http
GET /api/pharmacy/inventory
Authorization: Bearer {token}
```

---

## 💰 **Billing & Payment**

### **List Bills**
```http
GET /api/billing
Authorization: Bearer {token}
```

### **Create Bill**
```http
POST /api/billing
Authorization: Bearer {token}
Content-Type: application/json

{
  "patient_id": 123,
  "registration_id": 456,
  "items": [
    {
      "service_code": "POLI_DALAM",
      "description": "Konsultasi Poli Penyakit Dalam",
      "quantity": 1,
      "unit_price": 50000,
      "total": 50000
    },
    {
      "service_code": "CBC",
      "description": "Complete Blood Count",
      "quantity": 1,
      "unit_price": 75000,
      "total": 75000
    }
  ],
  "payment_method": "bpjs"
}
```

### **Process Payment**
```http
POST /api/billing/{id}/payment
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount_paid": 125000,
  "payment_method": "cash",
  "reference_number": "PAY-2025-001"
}
```

### **BPJS Claim Submission**
```http
POST /api/billing/{id}/bpjs-claim
Authorization: Bearer {token}
Content-Type: application/json

{
  "sep_number": "123456789",
  "claim_data": {
    "diagnosis_code": "J06.9",
    "procedure_code": "89.01",
    "tariff": 125000
  }
}
```

---

## 📊 **Reports & Analytics**

### **Dashboard Statistics**
```http
GET /api/dashboard/stats
Authorization: Bearer {token}
```

**Query Parameters:**
- `date_from`, `date_to`
- `department` - Filter by department

**Response:**
```json
{
  "success": true,
  "data": {
    "total_patients": 1250,
    "registrations_today": 45,
    "revenue_today": 2500000,
    "bed_occupancy": 78.5,
    "average_los": 3.2,
    "patient_satisfaction": 4.6
  }
}
```

### **SIRS Reports** (Kemenkes Compliance)
```http
GET /api/reports/sirs
Authorization: Bearer {token}
```

**Query Parameters:**
- `month`, `year` - Reporting period
- `report_type` - RL1, RL2, RL3, etc.

### **Custom Reports**
```http
POST /api/reports/custom
Authorization: Bearer {token}
Content-Type: application/json

{
  "report_type": "patient_flow",
  "filters": {
    "date_from": "2025-01-01",
    "date_to": "2025-01-31",
    "department": "Poli Dalam"
  },
  "format": "pdf"
}
```

---

## 🔧 **System Management** (Admin Only)

### **Audit Logs**
```http
GET /api/admin/audit-logs
Authorization: Bearer {token}
```

### **System Settings**
```http
GET /api/admin/settings
PUT /api/admin/settings
Authorization: Bearer {token}
```

### **Backup Management**
```http
POST /api/admin/backup
GET /api/admin/backups
Authorization: Bearer {token}
```

---

## 📋 **Error Responses**

### **Standard Error Format**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The given data was invalid.",
    "details": {
      "email": ["The email field is required."],
      "password": ["The password must be at least 8 characters."]
    }
  }
}
```

### **Common HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Unprocessable Entity
- `500` - Internal Server Error

### **Error Codes**
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_FAILED` - Invalid credentials
- `AUTHORIZATION_FAILED` - Insufficient permissions
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `BUSINESS_RULE_VIOLATION` - Business logic constraint violated
- `EXTERNAL_SERVICE_ERROR` - Integration with external service failed

---

## 🔄 **Rate Limiting**

- **Authenticated Requests:** 1000 requests per hour
- **Unauthenticated Requests:** 100 requests per hour
- **File Uploads:** 50 MB per hour

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1638360000
```

---

## 📝 **API Versioning**

All endpoints support versioning via Accept header:
```
Accept: application/vnd.sirama.v1+json
```

Current version: **v1**

---

**📖 Dokumentasi API ini akan diperbarui seiring penambahan fitur baru.**
