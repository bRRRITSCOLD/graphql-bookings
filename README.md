Make sure mongo is installed locally with a resplcaSet named rs. Make sure 3 collections ares are made previos to running code as this API uses transactions (Mongo DB 4.0+) and cannot create collections on the fly.

!!!!! WITH HELP SETTING UP REPLICA SETS - REFER TO SCRIPTS/MONGODB-REPLIACASET/READMEN.MD AND FOLLOW THE INSTURCTIONS !!!!!

Collections:
users-booking
events-booking
bookings-booking

```bash
$ npm install
```

debug with configuration in .vscode/launch.json (F5)

Finally - enjoy some pancakes
