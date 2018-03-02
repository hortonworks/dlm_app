/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { ActionWithPayload } from 'actions/actions.type';
import { type } from 'utils/type-action';
import { ConfirmationOptions, confirmationOptionsDefaults } from 'components/confirmation-modal';

export const ActionTypes = {
  CONFIRM_NEXT_ACTION: type('CONFIRM_NEXT_ACTION')
};

export const confirmNextAction =
  (nextAction: ActionWithPayload<any>, confirmationOptions: ConfirmationOptions = confirmationOptionsDefaults) => ({
    type: ActionTypes.CONFIRM_NEXT_ACTION,
    payload: { nextAction, confirmationOptions: {...confirmationOptionsDefaults, ...confirmationOptions} }
  });
