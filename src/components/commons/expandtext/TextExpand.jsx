import React, { useState } from 'react'
import { getLanguageClass } from '../../../utils/helperFunctions'
import { useTranslate } from '@tolgee/react'
const DEFAULT_MAX_LENGTH = 250



export default function TextExpand({ children, maxLength, language }) {
const { t } = useTranslate()
const [isExpanded, setIsExpanded] = useState(false)
if (typeof children !== 'string') return null
if (children.length === 0) return null
return (
<>
<div className={`commentary-content ${getLanguageClass(language)}`} dangerouslySetInnerHTML={{ __html: isExpanded ? children : `${children.substring(0, Number(maxLength) || DEFAULT_MAX_LENGTH)}` }} />
    {children.length > maxLength && (
        <button className="see-more-link" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? t('panel.showless') : t('panel.showmore')}
        </button>
    )}
</>
)
}