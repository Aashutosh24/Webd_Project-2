const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/deepsight", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ Connection failed:", err));

// Schema and model
const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phoneno: String,
  query: String
});

const Contact = mongoose.model("Contact", ContactSchema);

// Route
app.post("/api/contact", async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    await newContact.save();
    res.status(200).json({ message: "Contact info saved successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to save data", error: err });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});




const Datastore = require('nedb');
// const cors = require('cors'); // To allow requests from your frontend

const port = 3000; // You can change the port if needed

// Initialize NeDB database
const cartDb = new Datastore({ filename: 'cart.db', autoload: true });

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse incoming JSON requests

// API Endpoints

// Add item to cart
app.post('/cart/add', (req, res) => {
    const { userId, item } = req.body; // Assuming you have a way to identify users

    if (!userId || !item || !item.name || !item.price || !item.quantity) {
        return res.status(400).json({ message: 'Invalid request body' });
    }

    // Check if the user already has a cart
    cartDb.findOne({ userId: userId }, (err, cart) => {
        if (err) {
            return res.status(500).json({ message: 'Error finding cart' });
        }

        if (cart) {
            // User has a cart, check if the item is already in it
            const existingItemIndex = cart.items.findIndex(cartItem => cartItem.name === item.name);

            if (existingItemIndex > -1) {
                // Item exists, update quantity
                cart.items[existingItemIndex].quantity += item.quantity;
            } else {
                // Item doesn't exist, add it
                cart.items.push(item);
            }

            // Update the cart in the database
            cartDb.update({ userId: userId }, { $set: { items: cart.items } }, {}, (err, numReplaced) => {
                if (err) {
                    return res.status(500).json({ message: 'Error updating cart' });
                }
                res.json({ message: 'Item added to cart', cart: cart });
            });
        } else {
            // User doesn't have a cart, create a new one
            const newCart = { userId: userId, items: [item] };
            cartDb.insert(newCart, (err, createdCart) => {
                if (err) {
                    return res.status(500).json({ message: 'Error creating cart' });
                }
                res.status(201).json({ message: 'Cart created and item added', cart: createdCart });
            });
        }
    });
});

// Get cart contents
app.get('/cart/:userId', (req, res) => {
    const userId = req.params.userId;

    cartDb.findOne({ userId: userId }, (err, cart) => {
        if (err) {
            return res.status(500).json({ message: 'Error finding cart' });
        }

        if (cart) {
            res.json({ cart: cart });
        } else {
            res.status(404).json({ message: 'Cart not found for this user' });
        }
    });
});

// Update item quantity
app.put('/cart/update/:userId/:itemName', (req, res) => {
    const userId = req.params.userId;
    const itemName = req.params.itemName;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ message: 'Invalid quantity' });
    }

    cartDb.findOne({ userId: userId }, (err, cart) => {
        if (err) {
            return res.status(500).json({ message: 'Error finding cart' });
        }

        if (cart) {
            const existingItemIndex = cart.items.findIndex(cartItem => cartItem.name === itemName);

            if (existingItemIndex > -1) {
                if (quantity === 0) {
                    // Remove item if quantity is 0
                    cart.items.splice(existingItemIndex, 1);
                } else {
                    // Update quantity
                    cart.items[existingItemIndex].quantity = quantity;
                }

                cartDb.update({ userId: userId }, { $set: { items: cart.items } }, {}, (err, numReplaced) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error updating cart' });
                    }
                    res.json({ message: 'Cart updated', cart: cart });
                });
            } else {
                res.status(404).json({ message: 'Item not found in cart' });
            }
        } else {
            res.status(404).json({ message: 'Cart not found for this user' });
        }
    });
});

// Remove item from cart
app.delete('/cart/remove/:userId/:itemName', (req, res) => {
    const userId = req.params.userId;
    const itemName = req.params.itemName;

    cartDb.findOne({ userId: userId }, (err, cart) => {
        if (err) {
            return res.status(500).json({ message: 'Error finding cart' });
        }

        if (cart) {
            const initialItemCount = cart.items.length;
            cart.items = cart.items.filter(cartItem => cartItem.name !== itemName);

            if (cart.items.length < initialItemCount) {
                cartDb.update({ userId: userId }, { $set: { items: cart.items } }, {}, (err, numReplaced) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error updating cart' });
                    }
                    res.json({ message: 'Item removed from cart', cart: cart });
                });
            } else {
                res.status(404).json({ message: 'Item not found in cart' });
            }
        } else {
            res.status(404).json({ message: 'Cart not found for this user' });
        }
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
