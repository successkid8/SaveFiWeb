import { Idl } from '@project-serum/anchor';

export const SaveFiIdl: Idl = {
  version: '0.1.0',
  name: 'savefi',
  instructions: [
    {
      name: 'initializeVault',
      accounts: [
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'saveRate',
          type: 'u64',
        },
        {
          name: 'lockPeriod',
          type: 'i64',
        },
      ],
    },
    {
      name: 'save',
      accounts: [
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'withdraw',
      accounts: [
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'Vault',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'owner',
            type: 'publicKey',
          },
          {
            name: 'saveRate',
            type: 'u64',
          },
          {
            name: 'lockPeriod',
            type: 'i64',
          },
          {
            name: 'balance',
            type: 'u64',
          },
          {
            name: 'lastSaveTime',
            type: 'i64',
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'InsufficientFunds',
      msg: 'Insufficient funds in vault',
    },
    {
      code: 6001,
      name: 'LockPeriodNotExpired',
      msg: 'Lock period has not expired',
    },
    {
      code: 6002,
      name: 'InvalidAmount',
      msg: 'Invalid amount',
    },
  ],
  metadata: {
    address: 'SaveFi1111111111111111111111111111111111111',
  },
};

export default SaveFiIdl; 