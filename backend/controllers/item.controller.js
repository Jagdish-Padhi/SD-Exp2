import Item from "../models/item.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all items
export const getItems = asyncHandler(async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

// Get single item by ID
export const getItemById = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }
  res.json(item);
});

// Create new item
export const createItem = asyncHandler(async (req, res) => {
  const { name, description, price, category } = req.body;
  const newItem = new Item({ name, description, price, category });
  const savedItem = await newItem.save();
  res.status(201).json(savedItem);
});

// Update item
export const updateItem = asyncHandler(async (req, res) => {
  const updatedItem = await Item.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!updatedItem) {
    return res.status(404).json({ message: "Item not found" });
  }
  res.json(updatedItem);
});

// Delete item
export const deleteItem = asyncHandler(async (req, res) => {
  const deletedItem = await Item.findByIdAndDelete(req.params.id);
  if (!deletedItem) {
    return res.status(404).json({ message: "Item not found" });
  }
  res.json({ message: "Item deleted successfully" });
});
