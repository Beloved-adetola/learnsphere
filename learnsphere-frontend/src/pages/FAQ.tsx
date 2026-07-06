
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ: React.FC = () => {
  const faqs = [
    {
      question: 'What is LearnSphere?',
      answer: "LearnSphere is a comprehensive online platform for creating, managing, and taking quizzes. It's designed for educators, trainers, and organizations that need to assess knowledge in various fields."
    },
    {
      question: 'How do I create a quiz?',
      answer: "After signing up as an admin, you can navigate to your dashboard and click on \"Create Quiz\". You'll be able to select a category, add questions with multiple-choice options, and mark the correct answers."
    },
    {
      question: 'Can I edit a quiz after creating it?',
      answer: "Yes, as an admin you can edit any aspect of your quizzes at any time. Simply find the quiz in your dashboard and click on the edit button."
    },
    {
      question: 'How do candidates take quizzes?',
      answer: "Candidates can sign up for an account, browse available quizzes, and select one to take. They'll be presented with questions one by one, and upon submission, they'll receive their score and feedback."
    },
    {
      question: 'Is there a limit to how many quizzes I can create?',
      answer: "In the current version, there is no limit to the number of quizzes you can create as an admin."
    },
    {
      question: 'Can I see who has taken my quizzes?',
      answer: "Yes, admins can see statistics on who has taken their quizzes, including the number of attempts and scores."
    },
    {
      question: 'Is LearnSphere free to use?',
      answer: "LearnSphere offers both free and premium plans. The current version you're seeing demonstrates the core functionality that would be available for free."
    },
    {
      question: 'How secure are the quizzes?',
      answer: "LearnSphere uses modern security practices to ensure that quiz content is protected. Only authenticated users can access quizzes, and admins have control over who can see their quizzes."
    }
  ];

  return (
    <div className="quiz-container py-16">
      <h1 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h1>
      
      <div className="max-w-2xl mx-auto">
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
              <AccordionTrigger className="text-lg font-medium py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      
      <div className="mt-16 text-center">
        <h2 className="text-xl font-semibold mb-4">Still have questions?</h2>
        <p className="text-gray-600 mb-6">
          If you couldn't find the answer you were looking for, please reach out to our support team.
        </p>
        <a 
          href="/contact" 
          className="inline-block bg-quiz-primary text-white px-6 py-3 rounded-md hover:bg-quiz-primary/90 transition-colors"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
};

export default FAQ;
