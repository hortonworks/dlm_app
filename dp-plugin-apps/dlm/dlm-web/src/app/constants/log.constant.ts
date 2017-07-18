export enum EntityType {
  policy,
  policyinstance
}

export const LOG_EVENT_TYPE_MAP = {
  [EntityType.policy]: 'policyId',
  [EntityType.policyinstance]: 'instanceId'
};
