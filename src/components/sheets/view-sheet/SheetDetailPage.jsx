import React from 'react';
import { useParams } from 'react-router-dom';

const SheetDetailPage = () => {
  const { publisherName, sheetSlugAndId } = useParams();
  const sheetId = sheetSlugAndId.split('-').pop();
  return (
    <main>
       {sheetId}
    </main>
  );
};

export default SheetDetailPage; 