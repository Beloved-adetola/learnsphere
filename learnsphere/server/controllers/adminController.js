import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import admin from "firebase-admin";

export const createQuiz = async (req, res) => {
  try {
    const { title, description, category, isPublished, maxAttempts, timeLimit, password, questions } = req.body;
    
    const newQuiz = new Quiz({
      title,
      description,
      category,
      isPublished,
      maxAttempts: maxAttempts || 0,
      timeLimit: timeLimit || 0,
      password,
      createdBy: req.user.uid,
    });

    const createdQuestions = await Question.insertMany(
      questions.map((question) => ({
        ...question,
        quizId: newQuiz._id,
      }))
    );

    newQuiz.questions = createdQuestions.map((q) => q._id);
    await newQuiz.save();

    res.status(201).json(newQuiz);
  } catch (error) {
    console.error("error creating quiz:", error);
    res.status(500).json({ error: "Failed to create quiz", details: error.message, stack: error.stack });
  }
};

export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user.uid })
      .populate("questions")
      .lean();
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
};

// Update existing quiz
export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description, isPublished, maxAttempts, questions } = req.body;

    const quiz = await Quiz.findById(id);

    // Validation checks
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    if (quiz.createdBy !== req.user.uid) {
      return res.status(403).json({ error: "Unauthorized operation" });
    }

    // Update quiz metadata
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (req.body.maxAttempts !== undefined) updateData.maxAttempts = req.body.maxAttempts;
    if (req.body.timeLimit !== undefined) updateData.timeLimit = req.body.timeLimit;
    if (req.body.password !== undefined) updateData.password = req.body.password;

    // Handle questions update
    if (questions && Array.isArray(questions)) {
      // Delete existing questions
      await Question.deleteMany({ quizId: quiz._id });

      // Create new questions (stripping existing _id if present to avoid duplicate key errors)
      const newQuestions = await Question.insertMany(
        questions.map(({ _id, __v, ...question }) => ({
          ...question,
          quizId: quiz._id,
        }))
      );

      updateData.questions = newQuestions.map((q) => q._id);
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("questions");

    res.status(200).json(updatedQuiz);
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).json({ error: "Failed to update quiz" });
  }
};

// Delete quiz
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    if (quiz.createdBy !== req.user.uid) {
      return res.status(403).json({ error: "Unauthorized operation" });
    }

    // Delete related questions and quiz
    await Promise.all([
      Question.deleteMany({ quizId: id }),
      Quiz.deleteOne({ _id: id }),
    ]);

    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({ error: "Failed to delete quiz" });
  }
};

export const checkAdminStatus = async (req, res) => {
  try {
    const { uid } = req.user;

    // Example: Check Firestore for admin role
    const userDoc = await admin.firestore().doc(`users/${uid}`).get();
    const isAdmin = userDoc.data()?.isAdmin || false;

    res.json({ isAdmin });
  } catch (error) {
    res.status(500).json({ error: "Admin check failed" });
  }
};
