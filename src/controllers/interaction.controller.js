import { InteractionModel } from '../models/interaction.model.js';

export const handleReaction = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const { type } = req.body;
        const userId = req.user.id;

        const existing = await InteractionModel.findReaction(postId, userId);

        if (existing) {
            if (existing.reaction_type === type) {
                await InteractionModel.deleteReaction(postId, userId);
                return res.json({ success: true, message: "Olib tashlandi" });
            }
            const updated = await InteractionModel.updateReaction(postId, userId, type);
            return res.json({ success: true, data: updated });
        }

        const created = await InteractionModel.createReaction(postId, userId, type);
        res.status(201).json({ success: true, data: created });
    } catch (error) {
        next(error);
    }
};

export const handleSave = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        const result = await InteractionModel.toggleSave(postId, userId);
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};