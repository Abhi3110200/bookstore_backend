import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
    try {
        const { title, caption, image, rating } = req.body;
        if (!title || !caption || !image || !rating) {
            return res.status(400).json({ message: "Please provide all fields" });
        }

        //upload image to cloudinary
        const result = await cloudinary.uploader.upload(image);
        const imageUrl = result.secure_url;

        const newBook = await Book.create({
            title,
            caption,
            image: imageUrl,
            rating,
            user: req.user._id
        })

        await newBook.save();

        return res.status(201).json(newBook);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

// const response = await fetch('http://localhost:3000/api/books?page=1&limit=5')
// const data = await response.json();
// console.log(data);


//pagination => infinite scroll
router.get('/', protectRoute, async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;

        const books = await Book.find().sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "username profilePicture");


        const total = await Book.countDocuments();

        res.send({
            books,
            currentPage : page,
            totalBooks : total,
            totalPages : Math.ceil(total / limit)
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

router.get('/user' , protectRoute , async (req , res) => {
    try {
        const books = await Book.find({user : req.user._id}).sort({createdAt : -1});
        res.send(books);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

router.delete("/:id" , protectRoute , async (req , res) => {
    try {
        const book = await Book.findById(req.params.id);
        if(!book){
            return res.status(404).json({message : "Book not found"});
        }
        if(book.user.toString() !== req.user._id.toString()){
            return res.status(401).json({message : "Unauthorized"});
        }

        //delete image from cloudinary
        if(book.image && book.image.includes("cloudinary")){
            try{
                const public_id = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(public_id);
            }catch(error){
                console.log(error);
                return res.status(500).json({ message: "Internal server error" });
            }
        }

        await book.deleteOne();
        return res.status(200).json({message : "Book deleted successfully"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
})
export default router;

