'use client';

import React from 'react';
import { ConfirmationModal, ConfirmationModalProps } from './ConfirmationModal';

export interface InfoModalProps extends Omit<ConfirmationModalProps, 'type'> {
  type?: 'info' | 'warning' | 'error' | 'success';
}

export function InfoModal(props: InfoModalProps) {
  return (
    <ConfirmationModal
      {...props}
      type={props.type || 'info'}
      cancelButtonText={props.cancelButtonText || 'Close'}
    />
  );
}

export default InfoModal;
