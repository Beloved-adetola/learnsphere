// import { Request, Response } from 'express';
// import { Quiz } from '../models/Quiz';
// import { Question } from '../models/Question';
// import { UserAttempt } from '../models/UserAttempt';


// // Get available quizzes with filtering
// export const getAvailableQuizzes = async (req: Request, res: Response) => {
//   try {
//     const { category } = req.query;
//     const filter: { [key: string]: any } = {};

//     if (category) filter.category = category;

//     const quizzes = await Quiz.find(filter)
//       .select('title category createdAt')
//       .lean();

//     res.status(200).json(quizzes);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch quizzes' });
//   }
// };

// // Get quiz details for taking
// export const getQuizDetails = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
    
//     const quiz = await Quiz.findById(id)
//       .populate({
//         path: 'questions',
//         select: 'text options -_id', // Exclude correct answer and use simplified _id
//         options: { lean: true }
//       })
//       .lean();

//     if (!quiz) {
//       return res.status(404).json({ error: 'Quiz not found' });
//     }

//     // Structure questions with client-friendly IDs
//     const formattedQuestions = quiz.questions.map((question: any, index) => ({
//       ...question,
//       clientId: index + 1 // Simple numerical ID for client-side reference
//     }));

//     res.status(200).json({
//       ...quiz,
//       questions: formattedQuestions
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch quiz details' });
//   }
// };

// // Submit quiz answers
// export const submitQuizAnswers = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { answers } = req.body;
//     const userId = req.user.uid;

//     // Validate input
//     if (!answers || typeof answers !== 'object') {
//       return res.status(400).json({ error: 'Invalid answers format' });
//     }

//     // Get questions with correct answers
//     const quiz = await Quiz.findById(id).populate({
//       path: 'questions',
//       select: 'correctAnswer'
//     });

//     if (!quiz) {
//       return res.status(404).json({ error: 'Quiz not found' });
//     }

//     // Calculate score
//     let score = 0;
//     const questionMap = new Map(
//       quiz.questions.map((question: any) => [
//         question._id.toString(),
//         question.correctAnswer
//       ])
//     );

//     const answerDetails = Object.entries(answers).map(([questionId, answer]) => {
//       const isCorrect = questionMap.get(questionId) === answer;
//       if (isCorrect) score++;
//       return {
//         questionId,
//         selectedAnswer: answer,
//         isCorrect
//       };
//     });

//     // Save attempt
//     const attempt = new UserAttempt({
//       userId,
//       quizId: id,
//       score,
//       answers: answerDetails,
//       totalQuestions: quiz.questions.length
//     });

//     await attempt.save();

//     res.status(200).json({
//       score,
//       total: quiz.questions.length,
//       answers: answerDetails
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to submit quiz' });
//   }
// };

// // Get user's quiz history
// export const getQuizHistory = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user.uid;
    
//     const history = await UserAttempt.find({ userId })
//       .populate({
//         path: 'quizId',
//         select: 'title category'
//       })
//       .sort({ attemptDate: -1 })
//       .lean();

//     const formattedHistory = history.map(attempt => ({
//       _id: attempt._id,
//       quiz: attempt.quizId,
//       score: attempt.score,
//       total: attempt.totalQuestions,
//       date: attempt.attemptDate
//     }));

//     res.status(200).json(formattedHistory);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch quiz history' });
//   }
// };



import Quiz from '../models/Quiz.js';
import UserAttempt from '../models/UserAttempt.js';
import User from '../models/User.js';

export const getAvailableQuizzes = async (req, res) => {
  try {
    // Candidates only see published quizzes
    const quizzes = await Quiz.find({ isPublished: true })
      .select('title category description questions createdAt isPublished')
      .lean();
    console.log(`Found ${quizzes.length} published quizzes for candidate`);
    res.json(quizzes);
  } catch (error) {
    console.error("error in getAvailableQuizzes:", error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.id).populate('questions');
    
    let score = 0;
    const answerDetails = quiz.questions.map(question => {
      // Find the answer for this specific question from the frontend's answers array
      const questionIdStr = question._id.toString();
      const submittedAnswer = Array.isArray(answers) ? answers.find(a => a.questionId === questionIdStr) : null;
      const selectedOptionId = submittedAnswer ? submittedAnswer.selectedOptionId : null;
      
      const isCorrect = selectedOptionId && selectedOptionId.toString() === question.correctOptionId;
      if (isCorrect) score++;
      
      return {
        questionId: question._id,
        selectedOptionId: selectedOptionId,
        isCorrect: !!isCorrect
      };
    });

    const attempt = new UserAttempt({
      userId: req.user.uid,
      quizId: quiz._id,
      score,
      totalQuestions: quiz.questions.length,
      answers: answerDetails.map(a => ({
        questionId: a.questionId,
        selectedAnswer: a.selectedOptionId,
        isCorrect: a.isCorrect
      }))
    });

    await attempt.save();
    res.json({ score, totalQuestions: quiz.questions.length, answers: answerDetails });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
};

// Get quiz details for taking
export const getQuizDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { code } = req.query;
    
    const quiz = await Quiz.findById(id)
      .populate({
        path: 'questions',
        select: 'text options', // Include standard fields, exclude only sensitive if any
        options: { lean: true }
      })
      .lean();

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    // Check organization code lock
    const admin = await User.findOne({ uid: quiz.createdBy });
    
    // If the admin has set a code, enforce it
    if (admin && admin.organizationCode) {
      if (admin.organizationCode !== code) {
        return res.status(403).json({ error: 'Invalid or missing organization code' });
      }
    }

    // Structure questions with client-friendly IDs
    const formattedQuestions = quiz.questions.map((question, index) => ({
      ...question,
      id: question._id.toString(),
      clientId: index + 1 // Simple numerical ID for client-side reference
    }));

    // Check for previous attempts by this user
    const attemptCount = await UserAttempt.countDocuments({
      userId: req.user.uid,
      quizId: id
    });

    res.status(200).json({
      ...quiz,
      questions: formattedQuestions,
      userAttemptCount: attemptCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz details' });
  }
};

// Get user's quiz history
export const getQuizHistory = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const history = await UserAttempt.find({ userId })
      .populate({
        path: 'quizId',
        select: 'title category'
      })
      .sort({ attemptDate: -1 })
      .lean();

    const formattedHistory = history.map(attempt => ({
      id: attempt._id,
      quizId: attempt.quizId?._id?.toString() || attempt.quizId?.toString(),
      quiz: attempt.quizId, // Keep populated object for metadata
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      completedAt: attempt.attemptDate
    }));

    res.status(200).json(formattedHistory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz history' });
  }
};