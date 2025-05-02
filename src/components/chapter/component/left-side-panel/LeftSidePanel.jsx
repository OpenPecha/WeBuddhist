import React from "react";
import { IoMdClose } from "react-icons/io";
import { FiInfo } from "react-icons/fi";
import { usePanelContext } from "../../../../context/PanelContext.jsx";
import "./LeftSidePanel.scss";

const LeftSidePanel = () => {
  const { isLeftPanelOpen, closeLeftPanel } = usePanelContext();
  const showPanel = isLeftPanelOpen;
  
  const renderMainPanel = () => {
    return (
      <>
        <div className="headerthing">
          <p className='mt-4 px-4 listtitle'>Table of Content</p>
          <IoMdClose
            size={24}
            onClick={closeLeftPanel}
            className="close-icon"
          />
        </div>
        <div className="panel-content p-3">
          <p><FiInfo className="m-2"/> Dummy</p>
        </div>
      </>
    );
  };

  return (
    <>
      {showPanel && <div className="panel-backdrop" onClick={() => closeLeftPanel()}></div>}
      <div className={`left-panel navbaritems ${showPanel ? 'show' : ''}`}>
        {renderMainPanel()}
      </div>
    </>
  );
};

export default LeftSidePanel;
