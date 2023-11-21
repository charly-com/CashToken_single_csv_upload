const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const mongoose = require('mongoose');
const fs = require('fs').promises; // Use promisified version of fs
const util = require('util');
const pipeline = util.promisify(require('stream').pipeline);
const stream = require('stream');
const Readable = stream.Readable;

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://uchecharles223:ivQ3SW9dGn98lMc4@cluster0.h13dxe2.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a MongoDB schema
const entrySchema = new mongoose.Schema({
  msisdn: String,
  quantity: Number,
  narration: String,
});

const Entry = mongoose.model('Entry', entrySchema);

// Set up Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('csvFile'), async (req, res) => {
  try {
    // Check if file is provided
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    // Stream and parse CSV file
    const entries = await processCSV(req.file.buffer);

    // Save entries to the database
    await Entry.insertMany(entries);

    res.status(200).send('File uploaded and entries saved to the database.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing the file.');
  }
});

// Function to normalize MSISDN to international format
function normalizeMSISDN(msisdn) {
  // Example: Assuming all MSISDNs start with '0' and you want to replace it with '+234'
  return `+234${msisdn.slice(1)}`;
}

// Function to process CSV file
async function processCSV(buffer) {
  const readStream = new Readable();
  readStream._read = () => {}; // Necessary for the stream to start flowing

  readStream.push(buffer);
  readStream.push(null); // Signal the end of the stream

  const entries = [];

  const stream = csvParser()
    .on('data', (row) => {
      // Transform and normalize MSISDN to international format
      const msisdn = normalizeMSISDN(row.MSISDN);

      entries.push({
        msisdn,
        quantity: parseInt(row.quantity),
        narration: row.narration,
      });
    });

  // Pipe the ReadStream to the CSV parser
  await pipeline(readStream, stream);

  return entries;
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



