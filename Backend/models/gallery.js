import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        role: {
            type: String,
            enum: ["consumer", "staff"],
            required: true,
            index: true,
        },

        type: {
            type: String,
            enum: ["image", "video"],
            required: true,
        },

        url: {
            type: String,
            required: true,
        },

        publicId: {
            type: String,
            required: true,
        },

        caption: {
            type: String,
            trim: true,
            maxlength: 300,
            default: "",
        },

        isPublic: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

gallerySchema.index({
    owner: 1,
    createdAt: -1,
});

gallerySchema.index({
    role: 1,
    isPublic: 1,
    createdAt: -1,
});

export default mongoose.model("Gallery", gallerySchema);