import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';

const mapStateToProps = ({
  script: { nextInstructionId },
  environment: {promptFocusRequest},
}) => ({
  nextInstructionId,
  promptFocusRequest,
});
const mapDispatchToProps = {
  submitEditLine: text => ({ type: 'SUBMIT_EDIT_LINE', text }),
  promptHasFocused: () => ({type: 'PROMPT_HAS_FOCUSED'}),
};

export const Prompt = connect(
  mapStateToProps,
  mapDispatchToProps
)(({
  nextInstructionId,
  promptFocusRequest,
  submitEditLine,
  promptHasFocused,
}) => {
  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      setShouldSubmit(true);
    }
  };

  const handleChange = e => {
    setEditPrompt(e.target.value);
    if (shouldSubmit) {
      submitEditLine(e.target.value);
      setShouldSubmit(false);
    }
  };

  const handleScroll = e => setHeight(e.target.scrollHeight);

  const [editPrompt, setEditPrompt] = useState('');
  const [shouldSubmit, setShouldSubmit] = useState(false);

  const [currentInstructionId, setCurrentInstructionId] = useState(
    nextInstructionId
  );

  const [height, setHeight] = useState(20);

  if (currentInstructionId != nextInstructionId) {
    setCurrentInstructionId(nextInstructionId);
    setEditPrompt('');
    setHeight(20);
  }

  const inputRef = useRef();

  useEffect(() => {
    inputRef.current.focus();
    promptHasFocused();
  }, [inputRef, promptHasFocused]);

  useEffect(() => {
    inputRef.current.focus()
  }, [promptFocusRequest]);

  return (
    <tbody key="prompt">
      <tr>
        <td className="promptIndicator">&gt;</td>
        <td>
          <textarea
            onScroll={handleScroll}
            value={editPrompt}
            style={{ height: height }}
            ref={inputRef}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />
        </td>
      </tr>
    </tbody>
  );
});
