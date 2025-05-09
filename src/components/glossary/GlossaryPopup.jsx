import React, { useState } from 'react';
import { glossaryAPI } from '../../api/GlossaryApi'; // 경로는 실제 위치에 맞게 조정


// CSS를 JSX 파일 내에 style 객체로 포함
const styles = {
    glossaryToggle: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#007BFF',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '48px',
        height: '48px',
        fontSize: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'background 0.2s, transform 0.2s',
    },
    glossaryToggleHover: {
        background: '#0056b3',
        transform: 'scale(1.05)',
    },
    glossaryPopup: {
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        width: '320px',
        maxHeight: '420px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        animation: 'slideIn 0.3s forwards',
    },
    glossaryHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
    },
    glossaryHeaderTitle: {
        margin: 0,
        fontSize: '18px',
        color: '#333',
    },
    glossaryClose: {
        background: 'none',
        border: 'none',
        fontSize: '18px',
        cursor: 'pointer',
        color: '#666',
        transition: 'color 0.2s',
    },
    glossaryCloseHover: {
        color: '#000',
    },
    glossaryInput: {
        padding: '8px 12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
        marginBottom: '12px',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    glossaryInputFocus: {
        borderColor: '#007BFF',
    },
    glossaryButton: {
        background: '#007BFF',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 0',
        fontSize: '14px',
        cursor: 'pointer',
        marginBottom: '12px',
        transition: 'background 0.2s',
    },
    glossaryButtonHover: {
        background: '#0056b3',
    },
    glossaryList: {
        flex: 1,
        overflowY: 'auto',
    },
    glossaryItem: {
        padding: '8px 0',
        borderBottom: '1px solid #f1f1f1',
    },
    glossaryItemLast: {
        borderBottom: 'none',
    },
    glossaryTerm: {
        fontWeight: 600,
        color: '#007BFF',
    },
    glossaryDef: {
        margin: '4px 0 0',
        fontSize: '13px',
        color: '#555',
    },
    glossarySource: {
        fontSize: '11px',
        color: '#999',
        marginTop: '6px',
    },
    errorMessage: {
        color: 'red',
        fontSize: 13,
    },
    helpMessage: {
        color: '#888',
        fontSize: 13,
    }
};

// 애니메이션을 위한 keyframes를 style 태그로 추가
const keyframesStyle = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export default function GlossaryPopup() {
    const [term, setTerm] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isHovering, setIsHovering] = useState({
        button: false,
        close: false,
    });

    const handleSearch = async () => {
        if (!term.trim()) return;
        setError('');
        setResult(null);

        const response = await glossaryAPI.searchTerm(term);

        if (response.success) {
            setResult(response.data);
        } else {
            setError(response.error);
        }
    };

    return (
        <>
            {/* 애니메이션을 위한 style 태그 추가 */}
            <style>{keyframesStyle}</style>

            <button
                style={{
                    ...styles.glossaryToggle,
                    ...(isHovering.button ? styles.glossaryToggleHover : {})
                }}
                onClick={() => setIsOpen(o => !o)}
                onMouseEnter={() => setIsHovering({...isHovering, button: true})}
                onMouseLeave={() => setIsHovering({...isHovering, button: false})}
                title={isOpen ? '사전 닫기' : '사전 열기'}
            >
                📘
            </button>

            {isOpen && (
                <div style={styles.glossaryPopup}>
                    <div style={styles.glossaryHeader}>
                        <h3 style={styles.glossaryHeaderTitle}>용어 사전</h3>
                        <button
                            style={{
                                ...styles.glossaryClose,
                                ...(isHovering.close ? styles.glossaryCloseHover : {})
                            }}
                            onMouseEnter={() => setIsHovering({...isHovering, close: true})}
                            onMouseLeave={() => setIsHovering({...isHovering, close: false})}
                            onClick={() => setIsOpen(false)}
                        >✖</button>
                    </div>

                    <input
                        style={styles.glossaryInput}
                        type="text"
                        placeholder="정책 용어 입력"
                        value={term}
                        onChange={e => setTerm(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />

                    <button
                        style={{
                            ...styles.glossaryButton,
                            ...(isHovering.search ? styles.glossaryButtonHover : {})
                        }}
                        onMouseEnter={() => setIsHovering({...isHovering, search: true})}
                        onMouseLeave={() => setIsHovering({...isHovering, search: false})}
                        onClick={handleSearch}
                    >검색</button>

                    <div style={styles.glossaryList}>
                        {error && <div style={styles.errorMessage}>{error}</div>}

                        {result && (
                            <div style={styles.glossaryItem}>
                                <div style={styles.glossaryTerm}>{result.term}</div>
                                <div style={styles.glossaryDef}>{result.definition}</div>
                                {result.source && (
                                    <div style={styles.glossarySource}>
                                        출처: {result.source}
                                        {result.source === 'Wikipedia' && result.pageUrl && (
                                            <> | <a
                                                href={result.pageUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >더 보기</a></>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {!result && !error && (
                            <div style={styles.helpMessage}>검색어를 입력 후 엔터를 눌러주세요.</div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}