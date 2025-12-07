# AS25_Lotschberger

# User Stories / Scenario

User story 1, Patient:

I am a patient, and I would like to request my medication without visiting the pharmacy physically. I want to choose between pickup, home delivery, or locker pickup, so that I can receive my medication in the most convenient way for me.

Acceptance criteria, uploading prescription:
* The system allows image or PDF upload of a prescription.
* The system performs a basic format check (file size, image clarity).
* The prescription is forwarded to the pharmacy system in a structured format.
* The patient receives a confirmation that the prescription was successfully submitted.

Acceptance criteria, choosing a delivery option:
* The system displays available delivery options.
* The selected option is stored and forwarded to the pharmacy.
* The patient receives a notification once the medication is ready and available via the selected method.
  

User story 2, Pharmacist:

I am a pharmacist and I want to process medication orders digitally and efficiently to avoid manual document handling. I want the system to automatically check stock availability and handle ordering when medication is out of stock, so that patients receive their medication as quickly as possible.

Acceptance criteria:
* The pharmacist validates the digital prescription and confirms whether it is valid or invalid.
* The system automatically checks medication stock, and the pharmacist approves or adjusts reservations or orders.
* The pharmacist marks the medication as ready in the system, triggering an automatic notification to the patient.

# TO-BE Process

This chapter describes the redesigned and automated prescription handling process in our pharmacy workflow.
The new digital process significantly reduces manual effort, shortens waiting times for patients, and increases overall process efficiency.
It also provides a clear overview of the automated workflow steps and serves as a guide for reproducibility and implementation in future iterations of the project.
________________________________________
🧨 Features
Key features of the improved TO-BE process:

📲 Digital prescription upload
Patients can scan or upload their prescription via the system, removing the need for a physical visit at the start of the process.

🔍 Automated validation workflow
Uploaded prescriptions are forwarded directly to the pharmacy system, where staff can validate them digitally.
Invalid prescriptions trigger an automated notification back to the patient.

📦 Medication stock check & ordering
The system checks medication availability automatically:
•	If medication is in stock → it is reserved for the patient.
•	If medication is not in stock → an automatic order request is generated for the pharmacist.

🚚 Multiple delivery options
Patients can choose their preferred delivery method:
•	In-store pickup
•	Locker pickup
•	Home delivery
The system forwards the selected option to the pharmacy and handles the necessary logistics information.

🔔 Automated status notifications
Once the pharmacist marks the medication as ready, the system automatically notifies the patient via their preferred communication channel.

📁 Structured data handling
Prescription and medication data are stored in a structured and consistent format, enabling:
* traceable processing
* better reporting
* smoother integration with future systems

🔗 Integration-ready architecture
The process supports potential integration with external systems (e.g., ERP, logistics APIs, insurance systems), enabling end-to-end automation in future development phases.
