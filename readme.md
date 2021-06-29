## What is this?

Just you wait folks!

## Sample Data

To load sample data, run the following command in your terminal:

```bash
npm run sample
```

If you have previously loaded in this data, you can wipe your database 100% clean with:

```bash
npm run blowitallaway
```

That will populate 16 stores with 3 authors and 41 reviews. The logins for the authors are as follows:

| Name          | Email (login)        | Password |
| ------------- | -------------------- | -------- |
| AJONCODE      | ajoncode@example.com | wes      |
| Debbie Downer | debbie@example.com   | debbie   |
| Beau          | beau@example.com     | beau     |

## variables.env
```
NODE_ENV=development or production
DATABASE=mongodb://127.0.0.1:27017/databaseName
MAIL_USER=USERNAME
MAIL_PASS=PASSWORD
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
PORT=7777
MAP_KEY=GOOGLE_MAP_KEY
SECRET=RANDOM_SECRET
KEY=RANDOM_KEY
```