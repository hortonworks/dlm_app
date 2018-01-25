/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

export enum ModalSize {
  SMALL,
  MEDIUM,
  LARGE,
  FIXED400
}

export const SIZE_CLASS_MAP = {
  [ModalSize.FIXED400]: 'fixed-400',
  [ModalSize.SMALL]: 'small-modal',
  [ModalSize.MEDIUM]: 'medium-modal',
  [ModalSize.LARGE]: 'large-modal'
};
