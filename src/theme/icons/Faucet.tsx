import React, { FC } from 'react';

interface Props {
    size?: string | number;
    color?: string;
}

export const Faucet: FC<Props> = ({ size = 24, color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>{'🚰'}</span>
);
