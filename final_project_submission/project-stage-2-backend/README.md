# Database Design Summary (CS348 Project)

### 1. Collection (The "Table")

We have one main collection named `jobs`. Each document in this collection represents a single tennis racket restringing job.

### 2. Document Schema (The "Fields")

A document in the `jobs` collection has the following fields:

* `_id`: This is the **"primary key"**. MongoDB automatically creates and manages this field, ensuring every job has a unique identifier.
* `customerName`: (String) Stores the customer's name.
* `racketType`: (String) Stores the racket model (e.g., "Babolat Pure Aero").
* `stringType`: (String) Stores the chosen string (e.g., "Solinco Hyper-G").
* `tension`: (Number) Stores the requested tension in pounds.
* `dueDate`: (Date) Stores the date the job is needed by. This is used for sorting the "shortest due date" report.
* `status`: (String) Stores the job's current state ('Pending', 'In Progress', 'Completed').
* `createdAt`: (Timestamp) This is automatically added by Mongoose (`timestamps: true`). It stores when the job was first created, which is used for the "first come, first served" sorting.

### 3. Foreign Keys & Dynamic UI

* This simple design does not use foreign keys, as all data is stored in one collection.
* Updating UI based on the values that are inserted in the database.