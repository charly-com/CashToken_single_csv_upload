const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const mongoose = require('mongoose');
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

    // Divide entries into batches of 1000
    const batches = [];
    let batch = [];
    for (const entry of entries) {
      batch.push(entry);
      if (batch.length === 1000) {
        batches.push(batch);
        batch = [];
      }
    }
    if (batch.length > 0) {
      batches.push(batch);
    }

    // Save entries in batches
    for (const batch of batches) {
      //using the insertMany method instead of inserting each entry individually. This is more efficient
      await Entry.insertMany(batch);
    }

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
  readStream.push(buffer);
  readStream.push(null); // Signal the end of the stream

  const entries = [];

  const csvTransform = csvParser({
    mapHeaders: ({ header, index }) => header.trim(),
  });

  const transformStream = new stream.Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      const msisdn = normalizeMSISDN(chunk.MSISDN);

      this.push({
        msisdn,
        quantity: parseInt(chunk.quantity),
        narration: chunk.narration,
      });
      callback();
    },
  });

  // Pipe the ReadStream through csv-parser and the custom transform stream
  readStream.pipe(csvTransform).pipe(transformStream);

  // Collect the transformed entries
  for await (const entry of transformStream) {
    entries.push(entry);
  }

  return entries;
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});




