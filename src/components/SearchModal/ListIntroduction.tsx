import React from 'react'
import { Text } from 'rebass'
import { ExternalLink } from '../../theme'
import { ButtonPrimary } from '../Button'
import { OutlineCard } from '../Card'
import Column, { AutoColumn } from '../Column'
import { PaddedColumn } from './styleds'
import { useDarkModeManager } from '../../state/user/hooks'

import listLight from '../../assets/images/token-list/lists-light.png'
import listDark from '../../assets/images/token-list/lists-dark.png'

export default function ListIntroduction({ onSelectList }: { onSelectList: () => void }) {
  const [isDark] = useDarkModeManager()

  return (
    <Column style={{ width: '100%', flex: '1 1' }}>
      <PaddedColumn>
        <AutoColumn gap="14px">
          <img
            style={{ width: '120px', margin: '0 auto' }}
            src={isDark ? listDark : listLight}
            alt="token-list-preview"
          />
          <Text style={{ marginBottom: '8px', textAlign: 'center' }}>
            OctopusSwap now supports token lists. You can add your own custom lists via IPFS, HTTPS and ENS.{' '}
          </Text>
          <ButtonPrimary onClick={onSelectList} id="list-introduction-choose-a-list">
            Choose a list
          </ButtonPrimary>
          <OutlineCard style={{ marginBottom: '8px', padding: '1rem' }}>
            <Text fontWeight={400} fontSize={14} style={{ textAlign: 'center' }}>
              Token lists are an{' '}
              <ExternalLink href="https://tokenlists.org">tokenlists.org</ExternalLink> to learn more.
            </Text>
          </OutlineCard>
        </AutoColumn>
      </PaddedColumn>
    </Column>
  )
}
