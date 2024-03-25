import { asyncError } from "../middlewares/error.js";
import ErrorHandler from "../utils/error.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary";
import { Category } from "../models/category.js";


export const addCategoryImage = asyncError(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new ErrorHandler("Category not found", 404));

    if (!req.file) return next(new ErrorHandler("Please add image", 400));

    const file = getDataUri(req.file);
    const myCloud = await cloudinary.v2.uploader.upload(file.content);
    const image = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
    };

    category.images.push(image);
    await category.save();

    res.status(200).json({
        success: true,
        message: "Image Added Successfully",
    });
});

export const getCategoryDetails = asyncError(async (req, res, next) => {
    const category = await Category.findById(req.params.id).populate("category");
    
    if (!category) return next(new ErrorHandler("Category not found", 404));
    
    res.status(200).json({
        success: true,
        category,
    });
});

export const createcategory = asyncError(async (req, res, next) => {
    const { category} = req.body;
    
    if (!req.file) return next(new ErrorHandler("Please add image", 400));
    
    const file = getDataUri(req.file);
    const myCloud = await cloudinary.v2.uploader.upload(file.content);
    const image = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
    };
    
    await Category.create({
        category,
        images: [image],
    });
    
    res.status(200).json({
        success: true,
        message: "Category Created Successfully",
    });
});

export const updateCategory = asyncError(async (req, res, next) => {
    const { category} = req.body;
    const categories = await Category.findById(req.params.id);
    if (!categories) return next(new ErrorHandler("Category not found", 404));
    
    if (category) categories.category = category;
    
    await categories.save();
    
    res.status(200).json({
        success: true,
        message: "Category Updated Successfully",
    });
});

export const getAllCategories = asyncError(async (req, res, next) => {
    const categories = await Category.find({});

    res.status(200).json({
        success: true,
        categories,
    });
});

export const deleteCategoryImage = asyncError(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new ErrorHandler("Category not found", 404));
    
    const id = req.query.id;
    
    if (!id) return next(new ErrorHandler("Please Image Id", 400));
    
    let isExist = -1;
    
    category.images.forEach((item, index) => {
        if (item._id.toString() === id.toString()) isExist = index;
    });
    
    if (isExist < 0) return next(new ErrorHandler("Image doesn't exist", 400));
    
    await cloudinary.v2.uploader.destroy(category.images[isExist].public_id);
    
    category.images.splice(isExist, 1);
    
    await category.save();
    
    res.status(200).json({
        success: true,
        message: "Image Deleted Successfully",
    });
});

export const deleteCategory = asyncError(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new ErrorHandler("Category Not Found", 404));
    const categories = await Category.find({ category: category._id });

    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        category.category = undefined;
        await category.save();
    }

    await category.deleteOne();

    res.status(200).json({
    success: true,
    message: "Category Deleted Successfully",
    });
});