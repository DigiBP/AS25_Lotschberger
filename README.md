# AS25_Lotschberger 
This project digitizes and automates a pharmacy prescription workflow using **Camunda 7** and **Python External Task Workers**.  
The main goal is to enable automated prescription processing with a strong focus on locker pickup, allowing patients to collect their medication outside pharmacy opening hours.  
Patients upload a prescription digitally. The system validates the data, checks stock availability, handles ordering if necessary, supports pharmacist preparation, and finally notifies the patient when the medication is ready in a locker.

> Academic Context:   
This project was developed as part of a university study project focusing on Business Process Management (BPM) and process automation.  
> The primary objective is to design, model, and technically implement a realistic TO-BE business process using Camunda BPMN and external microservices.  
> The project emphasizes process orchestration, automation logic, and system interaction, rather than production-ready software or full frontend implementation.  
> All components (e.g. database, locker integration) are implemented as prototypes or conceptual simulations to demonstrate the feasibility of the process design.

## Authors 

The contributing members of the **AS25_Lotschberger** team are listed in [Table 1](#authores), with their names and contact information. 

|**Name**|**Email**|
|---|---|
|Feline Weger |feline.weger@students.fhnw.ch|
|Lukas Kamber|lukas.kamber@students.fhnw.ch|
|Semih Eryilmaz|semih.eryilmaz@students.fhnw.ch|
|Sivanajani Sivakumar|sivanajani.sivakumar@students.fhnw.ch|{#authores}


## Supervisors 👩‍💼

[Table 2](#supervisors) shows the names of the supervisors who provided guidance and expertise in the context of healthcare digitalization throughout the project.

|**Name**|**Email**|
|---|---|
|Andreas Martin| andreas.martin@fhnw.ch|
|Charuta Pande |charuta.pande@fhnw.ch|
|Devid Montecchiari |devid.montecchiari@fhnw.ch|{#supervisors}

## Table of contents

* [Core Use Case: Locker Pickup](#core-use-case-locker-pickup)
* [AS-IS Process](#as-is-process)

  * [Roles](#roles)
  * [Workflow](#workflow)
  * [Goal](#goal)
  * [User Story](#user-story)
* [TO-BE Process](#to-be-process)

  * [Features](#features)
  * [Camunda BPMN Workflow](#camunda-bpmn-workflow)
  * [Microservices](#microservices)

    * [Service 1: Validation & Stock Check Worker](#service-1-validation--stock-check-worker)
    * [Service 2: Ordering Worker](#service-2-ordering-worker)
    * [Service 3: Pharmacist Preparation Worker](#service-3-pharmacist-preparation-worker)
  * [How the services communicate (Process Variables)](#how-the-services-communicate-process-variables)
* [Run the workflow](#run-the-workflow)
* [Limitations](#limitations)
* [Tools used](#tools-used)

---

## Core Use Case: Locker Pickup

The locker option is the primary delivery method in this project.

- Medication is prepared by the pharmacist.  
- The medication is placed in a secure locker box.  
- The patient receives a notification with locker details.  
- The patient can pick up the medication 24/7, even when the pharmacy is closed.  

---

# AS-IS Process

![as-is](./image/Prescription_Filing_AS_IS.png)

## Roles

**External**

* Patient

**Internal**

* Pharmacist / Pharmacy staff

## Workflow

The current prescription process is largely manual:

1. The patient submits a prescription physically or via email.  
2. The pharmacist manually validates the prescription.  
3. Stock availability is checked manually.  
4. If the medication is not in stock, the pharmacist places a manual order and informs the patient that it will be available the next day (or later).  
5. The patient then either:  
    - returns to the pharmacy to pick it up during opening hours, or  
    - waits for home delivery if shipping is arranged.
6. Once the medication is ready, the patient is informed manually (e.g., verbally, phone call, or email).

## Limitations

- Manual coordination and manual status handling  
- Pickup is typically tied to pharmacy opening hours, resulting in limited flexibility for patients   
- No standardized “locker pickup” option with pickup code / secure handover

## Goal

Reduce manual effort, make the process traceable, and ensure patients can receive or collect their medication independently of pharmacy opening hours.

---

# User Story

**User story 1 (Pharmacist):**
As a pharmacist, I want to process medication orders digitally and efficiently to avoid manual document handling. I want the system to automatically check stock availability and handle ordering when medication is out of stock, so that patients receive their medication as quickly as possible.

**Acceptance criteria**
* The system automatically checks the digital prescription, checks medication stock, and the pharmacist approves or adjusts reservations or orders.
* The pharmacist marks the medication as ready in the system, triggering an automatic notification to the patient.

---

# TO-BE Process

This chapter describes the redesigned and automated prescription handling process.
The TO-BE process reduces manual work, shortens waiting times, and provides a reproducible architecture using Camunda + external Python workers.

![TO-BE](./image/Prescription_Filling_TO_BE.png)

## TO-BE Process Overview

The TO-BE process introduces **end-to-end digital automation**.

### Process Start

* The **patient uploads a prescription** via an external system (frontend, form, API).
* The uploaded data is passed as **process variables**.
* The upload **starts the Camunda process instance**.
* The prescription includes `preferredDelivery` (`locker`, `pickup`, or `home`).

## Features
Key features of the improved TO-BE process:

* Digital prescription upload:  
Patients can upload their prescription digitally, which serves as the trigger for starting the automated process.

* Automated validation workflow:  
Uploaded prescriptions are forwarded directly to the pharmacy system, where staff can validate them digitally.
Invalid prescriptions trigger an automated notification back to the patient.   

* Medication stock check & ordering:  
The system checks medication availability automatically:  
    * If medication is in stock → it is reserved for the patient.  
    * If medication is not in stock → an automatic order request is generated for the pharmacist.  

* Multiple delivery options:  
Patients can choose their preferred delivery method:
    *	In-store pickup
    * Locker pickup
    *	Home delivery   

    The system forwards the selected option to the pharmacy and handles the necessary logistics information.

* Automated status notifications:  
Once the pharmacist marks the medication as ready, the system automatically notifies the patient via their preferred communication channel.

* Structured data handling:  
Prescription and medication data are stored in a structured and consistent format, enabling:
    * traceable processing
    * better reporting
    * smoother integration with future systems

## TO-BE Workflow (Step-by-Step)

### 1. Validate Prescription (System Task)

* The system validates:

  * Required fields
  * Quantity
  * Prescription date
  * Delivery option
* **Invalid prescription: process is aborted**
* **Valid prescription: continue**

### 2. Check Stock Availability (System Task)

* The system checks the inventory database.
* Gateway decision:

  * **In stock**: reserve medication
  * **Not in stock**: create ordering task

### 3a. Medication In Stock

* Medication is reserved (System Task).
* Pharmacist order details are prepared (System Task).
* A preparation task is created (System Task).

### 3b. Medication Not In Stock

* An ordering task is created (System Task).
* The pharmacist (User Task):

  1. Orders the medication
  2. Receives the delivery
  3. Registers the delivery in the system
* Stock is updated and medication is reserved (System Task).
* Process continues with preparation (System Task).

### 4. Prepare Medication (Pharmacist - User Task)

* The pharmacist prepares the medication.
* Packaging follows the selected delivery method.

### 5. Mark Medication as Ready (Pharmacist User Task)

* The pharmacist marks the medication as ready in the system.
* This triggers the final system action.

### 6. Notify Patient (System Task)

**If `preferredDelivery = locker`:**

* The patient receives a notification containing:

  * Locker ID
  * Pickup code
* The medication is placed into the locker.
* The patient can collect the medication **at any time**.  

**If `preferredDelivery = home`:**
* The patient receives a notification containing:

  * Delivery Date

**If `preferredDelivery = pickup`:**
* The patient receives a notification containing:

  * Medication ready
* The patient can collect the medication **at opening hours**.

### Process End

* Medication is ready in the locker.
* Patient has been notified.
* Process ends successfully.

## Camunda BPMN Workflow

The TO-BE process is orchestrated using **Camunda 7** and modeled as a BPMN workflow.

* The BPMN model defines the **process flow**, gateways, and user/system tasks.
* **System Tasks** are implemented as *External Service Tasks*.
* **User Tasks** represent manual pharmacist interactions (ordering, preparation, marking medication as ready).
* The workflow is started programmatically when a prescription is uploaded and passed to Camunda as process variables.

Camunda acts as the **central process engine**, coordinating all steps and delegating technical logic to external microservices.


### Focus on Locker Pickup

While the process supports multiple delivery options, the **locker pickup scenario** represents the primary use case of this project.
It demonstrates how automated processes can enable secure, flexible, and time-independent medication pickup using BPMN-based orchestration.


---

# Microservices

All system logic is implemented using **Python External Task Workers**.
Each worker listens to specific **Camunda topics** and completes tasks via the Camunda REST API.

The microservices are executed independently (e.g. in Deepnote) and communicate **only via Camunda process variables**.

## Service 1: Validation & Stock Check Worker

**Worker ID:** `python-worker-main`

**Subscribed Topics:**

* `validatePrescription`
* `checkStock`
* `reserveMedication`

**Responsibilities:**

* Validate prescription data (mandatory fields, insurance number, date rules, quantity, delivery option)
* Check medication stock in the database
* Reserve medication if sufficient stock is available

**Key Outputs (Process Variables):**

* `prescriptionValid`
* `insuranceNumber`
* `validationMessage`
* `inStock`
* `availableQuantity`
* `reservationId`
* `reservationSuccess`
* `reservedMedicationName`
* `reservedQuantity`

This service ensures that only **valid prescriptions** proceed in the process and that medication availability is handled automatically.

## Service 2: Ordering Worker

**Worker ID:** `python-worker-ordering`

**Subscribed Topics:**

* `createOrderingTask`
* `updateStockAndReserve`

**Responsibilities:**

* Create an ordering task if medication is not in stock
* Generate a structured ordering description for the pharmacist
* Update stock after delivery registration
* Reserve medication after restocking

**Key Outputs (Process Variables):**

* `orderId`
* `orderDescription`
* `orderingTaskCreated`
* `reservationId`
* `reservationMessage`

This service supports the **out-of-stock scenario** and bridges the gap between ordering and preparation.

## Service 3: Pharmacist Preparation Worker

**Worker ID:** `python-worker-pharm`

**Subscribed Topics:**

* `preparePharmacistOrder`
* `createPreparationTask`

**Responsibilities:**

* Create a compact pharmacist order summary
* Generate internal preparation instructions
* Support the pharmacist in preparing and packaging medication

**Key Outputs (Process Variables):**

* `pharmacistOrderId`
* `pharmacistOrderSummary`
* `preparationTaskId`
* `preparationInstructions`

This service prepares all relevant information needed for the **manual pharmacist steps**.

---

# Database

The project includes a **database layer** to support stock management and reservations.

### Current State

* A database structure exists and is integrated into the microservices.
* It is used for:

  * Checking medication stock
  * Updating stock levels
  * Creating reservations
* At the current stage, the database is **initially minimally populated**, as the focus of the project lies on **process automation and orchestration**.

### Planned Usage

The database is designed to support:

* Medication inventory
* Stock quantities
* Reservations
* Orders

This allows realistic simulation of pharmacy operations and provides a foundation for future extensions.


![dataschema](./image/db_schema.png)

---

# How the services communicate (Process Variables)

The services exchange data only via **Camunda process variables**.

Key variables used across workers:

* Input (from process start / patient form later):

  * `insuranceNumber`, `medicationName`, `quantity`, `doctorName`, `preferredDelivery`, `prescriptionText`, `datePrescribed`
* Validation:

  * `prescriptionValid`, `validationMessage`
* Stock:

  * `inStock`, `availableQuantity`
* Reservation:

  * `reservationId`, `reservationSuccess`, `reservationMessage`, `reservedMedicationName`, `reservedQuantity`
* Ordering:

  * `orderId`, `orderDescription`, `orderingTaskCreated`
* Pharmacist:

  * `pharmacistOrderId`, `pharmacistOrderSummary`
  * `preparationTaskId`, `preparationInstructions`

---

# Run the Workflow

1. Start the **Camunda 7 engine**.
2. Start the Python workers in Deepnote (3 notebooks / scripts):

   * `python-worker-main`
   * `python-worker-ordering`
   * `python-worker-pharm`
3. Start the process instance in Camunda with initial variables (currently manual start; later via frontend upload).
4. Complete pharmacist user tasks in the Camunda Tasklist.
5. Observe automatic progression of system tasks.
6. Patient receives notification once medication is ready (locker, pickup, or delivery).

---

# Limitations

* Patient upload frontend is not part of this implementation.
* Locker hardware integration is conceptual.
* Notification service (email/SMS) is simulated and can be extended (e.g. via Make.com).
* Database content is minimal and intended for demonstration purposes.

---

# Tools Used

* Camunda 7 (BPMN, External Tasks)
* Python
* Deepnote
* REST APIs

---


