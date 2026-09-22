import React from 'react';
import { AddGameBaseInfo } from './forms/AddGameBaseInfo';
import { AddGamePersonalDetails } from './forms/AddGamePersonalDetails';

interface AddGameManualFormProps {
  gameData: any;
  handleGameDataChange: (data: any) => void;
  handleGenreToggle: (genre: string) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: () => void;
  formError: string | null;
  isAutoFilled: boolean;
  originalMetacritic?: number | undefined;
}

export default function AddGameManualForm({
  gameData,
  handleGameDataChange,
  handleGenreToggle,
  handleImageUpload,
  removeImage,
  formError,
  isAutoFilled,
  originalMetacritic
}: AddGameManualFormProps) {
  return (
    <div className="lg:col-span-2 space-y-8">
      <AddGameBaseInfo 
        gameData={gameData}
        handleGameDataChange={handleGameDataChange}
        handleGenreToggle={handleGenreToggle}
        handleImageUpload={handleImageUpload}
        removeImage={removeImage}
        formError={formError}
        isAutoFilled={isAutoFilled}
        originalMetacritic={originalMetacritic}
      />
      <AddGamePersonalDetails 
        gameData={gameData}
        handleGameDataChange={handleGameDataChange}
      />
    </div>
  );
}
