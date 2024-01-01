import React from 'react';

interface CollapseProps {
  title?: string;
  content?: string;
}

export default function Collapse({
  title = 'Title',
  content = 'Content',
}: CollapseProps) {
  return (
    <div
      tabIndex={0}
      className="collapse bg-primary text-lg font-bold text-neutral focus:bg-secondary focus:text-base-200"
    >
      <div className="collapse-title">{title}</div>
      <div className="collapse-content text-black">
        <p>{content}</p>
      </div>
    </div>
  );
}
