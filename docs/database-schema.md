# 🗄️ **SIRAMA - Database Schema**

Skema database lengkap untuk sistem SIRAMA dengan relasi antar tabel dan indeks yang diperlukan.

## 📊 **Entity Relationship Diagram (ERD)**

```
┌─────────────────┐       ┌─────────────────┐
│     users       │       │     roles       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ name            │       │ name            │
│ email           │       │ description     │
│ password        │       │ permissions     │
│ role_id (FK)    │◄──────┤                 │
│ department      │       └─────────────────┘
│ status          │
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         │
         ▼
┌─────────────────┐       ┌─────────────────┐
│    patients     │       │ registrations   │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ mrn             │       │ patient_id (FK) │
│ name            │       │ registration_no │
│ nik             │       │ service_unit    │
│ birth_date      │       │ doctor_id (FK)  │
│ gender          │       │ arrival_type    │
│ phone           │       │ payment_method  │
│ address         │       │ queue_number    │
│ emergency_contact│      │ status          │
│ bpjs_number     │       │ created_at      │
│ status          │       │ updated_at      │
│ created_at      │◄──────┤                 │
│ updated_at      │       └─────────────────┘
└─────────────────┘               │
         │                        │
         │                        │
         ▼                        ▼
┌─────────────────┐       ┌─────────────────┐
│   emr_records   │       │   vital_signs   │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ patient_id (FK) │       │ emr_id (FK)     │
│ registration_id │       │ blood_pressure  │
│ chief_complaint │       │ heart_rate      │
│ history         │       │ temperature     │
│ physical_exam   │       │ respiratory_rate│
│ diagnosis       │       │ oxygen_sat      │
│ icd_code        │       │ recorded_by     │
│ treatment_plan  │       │ recorded_at     │
│ created_by      │       └─────────────────┘
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         │
         ▼
┌─────────────────┐       ┌─────────────────┐
│   prescriptions │       │ prescription_   │
├─────────────────┤       │    items        │
│ id (PK)         │       ├─────────────────┤
│ emr_id (FK)     │       │ id (PK)         │
│ patient_id (FK) │       │ prescription_id │
│ status          │       │ medicine_id (FK)│
│ created_by      │       │ dose            │
│ validated_by    │       │ frequency       │
│ dispensed_by    │       │ duration        │
│ created_at      │       │ quantity        │
│ updated_at      │       └─────────────────┘
└─────────────────┘
```

## 📋 **Detailed Table Schemas**

### **1. users**
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    department VARCHAR(100) NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    INDEX idx_email (email),
    INDEX idx_role (role_id),
    INDEX idx_status (status),
    INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **2. roles**
```sql
CREATE TABLE roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    permissions JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **3. patients**
```sql
CREATE TABLE patients (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mrn VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    nik VARCHAR(16) UNIQUE NULL,
    birth_date DATE NOT NULL,
    gender ENUM('L', 'P') NOT NULL,
    phone VARCHAR(20) NULL,
    address TEXT NULL,
    emergency_contact VARCHAR(20) NULL,
    bpjs_number VARCHAR(20) UNIQUE NULL,
    status ENUM('active', 'inactive', 'deceased') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_mrn (mrn),
    INDEX idx_nik (nik),
    INDEX idx_bpjs (bpjs_number),
    INDEX idx_status (status),
    INDEX idx_name (name),
    FULLTEXT idx_fulltext (name, address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **4. registrations**
```sql
CREATE TABLE registrations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT UNSIGNED NOT NULL,
    registration_no VARCHAR(20) UNIQUE NOT NULL,
    service_unit VARCHAR(100) NOT NULL,
    doctor_id BIGINT UNSIGNED NULL,
    arrival_type ENUM('mandiri', 'rujukan', 'igd') DEFAULT 'mandiri',
    referral_source VARCHAR(255) NULL,
    payment_method ENUM('tunai', 'bpjs', 'asuransi') DEFAULT 'tunai',
    insurance_number VARCHAR(50) NULL,
    queue_number VARCHAR(10) NULL,
    status ENUM('registered', 'checked-in', 'completed', 'cancelled') DEFAULT 'registered',
    notes TEXT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,

    INDEX idx_patient (patient_id),
    INDEX idx_doctor (doctor_id),
    INDEX idx_registration_no (registration_no),
    INDEX idx_service_unit (service_unit),
    INDEX idx_status (status),
    INDEX idx_date (DATE(created_at)),
    INDEX idx_queue (queue_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **5. emr_records (Electronic Medical Records)**
```sql
CREATE TABLE emr_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT UNSIGNED NOT NULL,
    registration_id BIGINT UNSIGNED NOT NULL,
    chief_complaint TEXT NOT NULL,
    history TEXT NULL,
    physical_exam TEXT NULL,
    diagnosis TEXT NULL,
    icd_code VARCHAR(10) NULL,
    treatment_plan TEXT NULL,
    follow_up_date DATE NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,

    INDEX idx_patient (patient_id),
    INDEX idx_registration (registration_id),
    INDEX idx_doctor (created_by),
    INDEX idx_date (DATE(created_at)),
    INDEX idx_icd (icd_code),
    FULLTEXT idx_fulltext (chief_complaint, diagnosis, treatment_plan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **6. vital_signs**
```sql
CREATE TABLE vital_signs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    emr_id BIGINT UNSIGNED NOT NULL,
    blood_pressure VARCHAR(20) NULL,
    heart_rate INT NULL,
    temperature DECIMAL(4,1) NULL,
    respiratory_rate INT NULL,
    oxygen_saturation INT NULL,
    weight DECIMAL(5,2) NULL,
    height DECIMAL(5,2) NULL,
    bmi DECIMAL(4,1) NULL,
    recorded_by BIGINT UNSIGNED NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (emr_id) REFERENCES emr_records(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE RESTRICT,

    INDEX idx_emr (emr_id),
    INDEX idx_recorded_by (recorded_by),
    INDEX idx_date (DATE(recorded_at))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **7. cppt_records (Care Plan Progress Tracking)**
```sql
CREATE TABLE cppt_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    emr_id BIGINT UNSIGNED NOT NULL,
    subjective TEXT NULL,
    objective TEXT NULL,
    assessment TEXT NULL,
    plan TEXT NULL,
    recorded_by BIGINT UNSIGNED NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (emr_id) REFERENCES emr_records(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE RESTRICT,

    INDEX idx_emr (emr_id),
    INDEX idx_recorded_by (recorded_by),
    INDEX idx_date (DATE(recorded_at)),
    FULLTEXT idx_fulltext (subjective, objective, assessment, plan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **8. laboratory_orders**
```sql
CREATE TABLE laboratory_orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT UNSIGNED NOT NULL,
    emr_id BIGINT UNSIGNED NOT NULL,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    priority ENUM('routine', 'urgent', 'stat') DEFAULT 'routine',
    clinical_info TEXT NULL,
    status ENUM('ordered', 'sampled', 'processing', 'completed', 'cancelled') DEFAULT 'ordered',
    ordered_by BIGINT UNSIGNED NOT NULL,
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    FOREIGN KEY (emr_id) REFERENCES emr_records(id) ON DELETE RESTRICT,
    FOREIGN KEY (ordered_by) REFERENCES users(id) ON DELETE RESTRICT,

    INDEX idx_patient (patient_id),
    INDEX idx_emr (emr_id),
    INDEX idx_order_number (order_number),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_date (DATE(ordered_at))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **9. laboratory_tests**
```sql
CREATE TABLE laboratory_tests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    test_code VARCHAR(20) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    result_value VARCHAR(100) NULL,
    unit VARCHAR(20) NULL,
    reference_range VARCHAR(50) NULL,
    status ENUM('pending', 'normal', 'abnormal', 'critical') DEFAULT 'pending',
    notes TEXT NULL,

    FOREIGN KEY (order_id) REFERENCES laboratory_orders(id) ON DELETE CASCADE,

    INDEX idx_order (order_id),
    INDEX idx_test_code (test_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **10. radiology_orders**
```sql
CREATE TABLE radiology_orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT UNSIGNED NOT NULL,
    emr_id BIGINT UNSIGNED NOT NULL,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    modality VARCHAR(50) NOT NULL,
    body_part VARCHAR(100) NOT NULL,
    clinical_info TEXT NULL,
    priority ENUM('routine', 'urgent', 'stat') DEFAULT 'routine',
    status ENUM('ordered', 'scheduled', 'completed', 'cancelled') DEFAULT 'ordered',
    ordered_by BIGINT UNSIGNED NOT NULL,
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    FOREIGN KEY (emr_id) REFERENCES emr_records(id) ON DELETE RESTRICT,
    FOREIGN KEY (ordered_by) REFERENCES users(id) ON DELETE RESTRICT,

    INDEX idx_patient (patient_id),
    INDEX idx_emr (emr_id),
    INDEX idx_order_number (order_number),
    INDEX idx_modality (modality),
    INDEX idx_status (status),
    INDEX idx_date (DATE(ordered_at))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **11. radiology_results**
```sql
CREATE TABLE radiology_results (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    findings TEXT NULL,
    impression TEXT NULL,
    recommendation TEXT NULL,
    image_path VARCHAR(500) NULL,
    reported_by BIGINT UNSIGNED NULL,
    reported_at TIMESTAMP NULL,

    FOREIGN KEY (order_id) REFERENCES radiology_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_order (order_id),
    INDEX idx_reported_by (reported_by),
    INDEX idx_date (DATE(reported_at))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **12. prescriptions**
```sql
CREATE TABLE prescriptions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    emr_id BIGINT UNSIGNED NOT NULL,
    patient_id BIGINT UNSIGNED NOT NULL,
    prescription_number VARCHAR(20) UNIQUE NOT NULL,
    status ENUM('draft', 'validated', 'dispensed', 'cancelled') DEFAULT 'draft',
    notes TEXT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    validated_by BIGINT UNSIGNED NULL,
    validated_at TIMESTAMP NULL,
    dispensed_by BIGINT UNSIGNED NULL,
    dispensed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (emr_id) REFERENCES emr_records(id) ON DELETE RESTRICT,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (dispensed_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_emr (emr_id),
    INDEX idx_patient (patient_id),
    INDEX idx_prescription_number (prescription_number),
    INDEX idx_status (status),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **13. prescription_items**
```sql
CREATE TABLE prescription_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    prescription_id BIGINT UNSIGNED NOT NULL,
    medicine_id BIGINT UNSIGNED NOT NULL,
    dose VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    instructions TEXT NULL,

    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE RESTRICT,

    INDEX idx_prescription (prescription_id),
    INDEX idx_medicine (medicine_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **14. medicines**
```sql
CREATE TABLE medicines (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255) NULL,
    dosage_form VARCHAR(50) NOT NULL,
    strength VARCHAR(50) NULL,
    unit VARCHAR(20) NOT NULL,
    category VARCHAR(50) NULL,
    manufacturer VARCHAR(100) NULL,
    batch_number VARCHAR(50) NULL,
    expiry_date DATE NULL,
    stock_quantity INT DEFAULT 0,
    min_stock INT DEFAULT 0,
    max_stock INT DEFAULT 0,
    unit_price DECIMAL(10,2) NULL,
    status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_name (name),
    INDEX idx_generic (generic_name),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_expiry (expiry_date),
    FULLTEXT idx_fulltext (name, generic_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **15. billing**
```sql
CREATE TABLE billing (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT UNSIGNED NOT NULL,
    registration_id BIGINT UNSIGNED NOT NULL,
    bill_number VARCHAR(20) UNIQUE NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    payment_method ENUM('tunai', 'bpjs', 'asuransi') DEFAULT 'tunai',
    payment_status ENUM('unpaid', 'partial', 'paid', 'claim') DEFAULT 'unpaid',
    insurance_number VARCHAR(50) NULL,
    due_date DATE NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    paid_at TIMESTAMP NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,

    INDEX idx_patient (patient_id),
    INDEX idx_registration (registration_id),
    INDEX idx_bill_number (bill_number),
    INDEX idx_payment_status (payment_status),
    INDEX idx_date (DATE(created_at))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **16. billing_items**
```sql
CREATE TABLE billing_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    billing_id BIGINT UNSIGNED NOT NULL,
    service_code VARCHAR(20) NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (billing_id) REFERENCES billing(id) ON DELETE CASCADE,

    INDEX idx_billing (billing_id),
    INDEX idx_service_code (service_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **17. antrol_queues (Mobile JKN Queues)**
```sql
CREATE TABLE antrol_queues (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT UNSIGNED NOT NULL,
    booking_code VARCHAR(20) UNIQUE NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    estimated_time TIME NULL,
    queue_number INT NOT NULL,
    status ENUM('waiting', 'called', 'served', 'cancelled') DEFAULT 'waiting',
    source ENUM('mobile_jkn', 'website', 'counter') DEFAULT 'counter',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id) REFERENCES patients(id),
    INDEX idx_patient (patient_id),
    INDEX idx_booking_code (booking_code),
    INDEX idx_status (status),
    INDEX idx_date (DATE(created_at))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **18. referrals (Referral System)**
```sql
CREATE TABLE referrals (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT UNSIGNED NOT NULL,
    registration_id BIGINT UNSIGNED NOT NULL,
    referral_number VARCHAR(20) UNIQUE NOT NULL,
    referral_type ENUM('up', 'horizontal', 'down') NOT NULL,
    from_facility VARCHAR(100) NOT NULL,
    to_facility VARCHAR(100) NOT NULL,
    diagnosis TEXT NOT NULL,
    reason TEXT NOT NULL,
    urgency ENUM('elective', 'urgent', 'emergency') DEFAULT 'elective',
    status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    approved_by BIGINT UNSIGNED NULL,
    approved_at TIMESTAMP NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,

    INDEX idx_patient (patient_id),
    INDEX idx_referral_number (referral_number),
    INDEX idx_status (status),
    INDEX idx_urgency (urgency)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **19. appointments (Online Booking)**
```sql
CREATE TABLE appointments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT UNSIGNED NOT NULL,
    doctor_id BIGINT UNSIGNED NOT NULL,
    service_unit VARCHAR(100) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INT DEFAULT 30,
    appointment_type ENUM('consultation', 'follow_up', 'procedure') DEFAULT 'consultation',
    status ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    notes TEXT NULL,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,

    INDEX idx_patient (patient_id),
    INDEX idx_doctor (doctor_id),
    INDEX idx_date_time (appointment_date, appointment_time),
    INDEX idx_status (status),
    UNIQUE KEY unique_appointment (doctor_id, appointment_date, appointment_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **20. kpi_reports (KPI Dashboard)**
```sql
CREATE TABLE kpi_reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    report_type VARCHAR(50) NOT NULL,
    report_date DATE NOT NULL,
    period VARCHAR(20) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    target_value DECIMAL(10,2) NULL,
    achievement_percentage DECIMAL(5,2) NULL,
    department VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_report_type (report_type),
    INDEX idx_date (report_date),
    INDEX idx_period (period),
    INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **21. patient_notifications (Patient Communication)**
```sql
CREATE TABLE patient_notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT UNSIGNED NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    channel ENUM('sms', 'whatsapp', 'email') NOT NULL,
    message TEXT NOT NULL,
    status ENUM('sent', 'delivered', 'failed') DEFAULT 'sent',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id) REFERENCES patients(id),
    INDEX idx_patient (patient_id),
    INDEX idx_type (notification_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **17. audit_logs**
```sql
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(100) NOT NULL,
    model_type VARCHAR(100) NULL,
    model_id BIGINT UNSIGNED NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_model (model_type, model_id),
    INDEX idx_date (DATE(created_at))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 🔍 **Database Indexes & Performance**

### **Critical Indexes (High Priority)**
```sql
-- Patient search performance
CREATE INDEX idx_patients_name_dob ON patients (name, birth_date);
CREATE INDEX idx_patients_mrn_status ON patients (mrn, status);

-- Registration performance
CREATE INDEX idx_registrations_patient_date ON registrations (patient_id, DATE(created_at));
CREATE INDEX idx_registrations_status_date ON registrations (status, DATE(created_at));

-- EMR performance
CREATE INDEX idx_emr_patient_date ON emr_records (patient_id, DATE(created_at));
CREATE INDEX idx_emr_doctor_date ON emr_records (created_by, DATE(created_at));

-- Billing performance
CREATE INDEX idx_billing_patient_status ON billing (patient_id, payment_status);
CREATE INDEX idx_billing_date_status ON billing (DATE(created_at), payment_status);
```

### **Fulltext Indexes**
```sql
-- Patient search
ALTER TABLE patients ADD FULLTEXT idx_patients_search (name, address, phone);

-- Medical records search
ALTER TABLE emr_records ADD FULLTEXT idx_emr_search (chief_complaint, diagnosis, treatment_plan);

-- Medicine search
ALTER TABLE medicines ADD FULLTEXT idx_medicines_search (name, generic_name);
```

## 📊 **Data Partitioning Strategy**

### **Large Tables Partitioning**
```sql
-- Partition emr_records by year
ALTER TABLE emr_records PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027)
);

-- Partition audit_logs by month
ALTER TABLE audit_logs PARTITION BY RANGE (MONTH(created_at)) (
    PARTITION p01 VALUES LESS THAN (2),
    PARTITION p02 VALUES LESS THAN (3),
    PARTITION p03 VALUES LESS THAN (4),
    PARTITION p04 VALUES LESS THAN (5),
    PARTITION p05 VALUES LESS THAN (6),
    PARTITION p06 VALUES LESS THAN (7),
    PARTITION p07 VALUES LESS THAN (8),
    PARTITION p08 VALUES LESS THAN (9),
    PARTITION p09 VALUES LESS THAN (10),
    PARTITION p10 VALUES LESS THAN (11),
    PARTITION p11 VALUES LESS THAN (12),
    PARTITION p12 VALUES LESS THAN (13)
);
```

## 🔄 **Database Migrations Strategy**

### **Migration Naming Convention**
```
YYYY_MM_DD_HHMMSS_create_table_name.php
YYYY_MM_DD_HHMMSS_add_column_to_table.php
YYYY_MM_DD_HHMMSS_create_index_on_table.php
```

### **Migration Best Practices**
- ✅ Use descriptive names
- ✅ Include rollback functionality
- ✅ Test migrations on staging
- ✅ Backup before running on production
- ✅ Use transactions for data changes

## 💾 **Backup & Recovery**

### **Backup Strategy**
```sql
-- Daily full backup
mysqldump --all-databases --single-transaction > full_backup_$(date +%Y%m%d).sql

-- Hourly incremental backup for critical tables
mysqldump sirama emr_records registrations billing > incremental_$(date +%Y%m%d_%H).sql
```

### **Point-in-Time Recovery**
```sql
-- Restore from backup
mysql < full_backup_20251101.sql

-- Apply binary logs
mysqlbinlog --start-datetime="2025-11-01 10:00:00" mysql-bin.000001 | mysql
```

---

**📋 Skema database ini dirancang untuk performa tinggi dan skalabilitas dengan indeks yang optimal untuk query umum dalam sistem SIMRS.**
