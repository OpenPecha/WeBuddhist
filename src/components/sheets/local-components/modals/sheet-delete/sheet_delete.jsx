import React, { useState } from 'https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js';
import ReactDOM from 'https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js';

const Modal = ({ isOpen, onClose, onDelete }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <button
          onClick={onClose}
          className="close-button"
        >
          ×
        </button>
        <h2>Delete story</h2>
        <p>
          Deletion is not reversible, and the story will be completely deleted. If you do not
          want to delete, you can unlist the story.
        </p>
        <div className="button-group">
          <button
            onClick={onClose}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="delete-button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = () => {
    console.log("Story deleted");
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Open Modal
      </button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={handleDelete}
      />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));