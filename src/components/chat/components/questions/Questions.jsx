import React from 'react'

const questions = [
    {
        id: 1,
        question: 'What is the first Verse of The Way of the Bodhisattva?',
    },
    {
        id: 2,
        question: ' what is self?',
    },
    {
        id: 3,
        question: 'How one can attain enlightenment?',
    },
    {
        id: 4,
        question: 'Who are the eight students of the Buddha?',
    },
    {
        id: 5,
        question: 'What is the Buddha\'s teaching?',
    }
]
const Questions = () => {
  return (
    <div className="flex flex-wrap gap-3 text-sm rounded-2xl p-2">
        {questions.map((question) => (
            <div
                key={question.id}
                className="flex items-center border-y border-x border-[#c0c0c0] bg-white rounded-2xl border-dashed p-2"
            >
                <span>{question.question}</span>
            </div>
        ))}
    </div>
  ) 
}

export default Questions