import React from 'react'

const questions = [
    {
        id: 1,
        question: 'What is the first Verse of The Way of the Bodhisattva?',
    },
    {
        id: 2,
        question: 'Who are the eight students of the Buddha?',
    },
    {
        id: 3,
        question: 'What is the name of the first king of Tibet?',
    },
    {
        id: 4,
        question: 'what is self.',
    },
    {
        id: 5,
        question: 'What is the name of the first queen of Tibet?',
    },
]
const Questions = () => {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl p-2">
        {questions.map((question) => (
            <div
                key={question.id}
                className="flex items-center bg-gray-50  p-2"
            >
                <span>{question.question}</span>
            </div>
        ))}
    </div>
  ) 
}

export default Questions