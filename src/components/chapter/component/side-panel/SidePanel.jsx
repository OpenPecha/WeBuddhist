import React from "react";
import { FiMenu } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import "./SidePanel.scss";

const SidePanel = ({ isOpen, togglePanel, children }) => {
  return (
    <>
      {!isOpen && (
        <button
          className="side-panel-toggle"
          onClick={togglePanel}
          aria-label="Toggle side panel"
        >
          <FiMenu />
        </button>
      )}

      <div className={`side-panel ${isOpen ? "open" : ""}`}>
        <div className="side-panel-header">
          <h3>Table of Contents</h3>
          <button
            className="side-panel-close-button"
            onClick={togglePanel}
            aria-label="Close panel"
          >
            <IoMdClose />
          </button>
        </div>
        <div className="side-panel-content">{children}</div>
      </div>
    </>
  );
};

export default SidePanel;
