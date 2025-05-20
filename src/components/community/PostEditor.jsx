import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent as TiptapEditorContent } from '@tiptap/react';
import { Mark, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'

import styled from 'styled-components';
import { postAPI } from '../../api/PostApi';
import { fileAPI } from '../../api/FileApi';
import { spamCheckAPI } from '../../api/SpamCheckApi';
import useCategoryStore from '../../store/categoryStore';

import ReCAPTCHA from "react-google-recaptcha";
import ReCaptchaModal from '../spam-check/ReCaptchaModal';

// #region styled-components
const Container = styled.div`
  max-width: 1200px;
  margin: 30px auto;
  padding: 0 20px;
  background-color: #f5f6f7;
`;

const WriteForm = styled.form`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 30px;
`;

const FormHeader = styled.div`
  margin-bottom: 30px;
  text-align: center;

  h1 {
    font-size: 24px;
    color: #333;
    margin-bottom: 10px;
  }

  p {
    color: #777;
    font-size: 15px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 15px;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 15px;
`;

const CategorySelect = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 25px;
`;

const CategoryItem = styled.div`
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 50px;
  font-size: 14px;
  color: #666;
  background-color: #fff;
  transition: all 0.2s;

  cursor: ${({ $readonly }) => ($readonly ? 'default' : 'pointer')};

  &.active {
    background-color: #333;
    color: #fff;
    border-color: #333;
  }
`;

const FileUpload = styled.div`
  margin-bottom: 20px;
`;

const FileButton = styled.label`
  display: inline-flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #555;
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  pointer-events: ${({ disabled }) => disabled ? 'none' : 'auto'};

  &:hover {
    background-color: ${({ disabled }) => disabled ? '#f5f5f5' : '#eee'};
  }

  i {
    margin-right: 8px;
  }
`;

const FileList = styled.div`
  margin-top: 10px;
  font-size: 14px;
  color: #555;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 0;
`;

const FileName = styled.span`

`;

const RemoveButton = styled.button`
  margin-left: 10px;
  background: none;
  border: none;
  color: #d33;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
`;

const FileLimitNotice = styled.div`
  color: #d33;
  margin-top: 5px;
`;

const EditorContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 25px;
`;

const EditorToolbar = styled.div`
  display: flex;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #eee;
  background-color: #f9f9f9;
`;

const ToolbarButton = styled.button`
  background: none;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  color: #555;
  &:hover {
    background-color: #eee;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
`;

const Button = styled.button`
  padding: 12px 25px;
  border-radius: 4px;
  font-size: 15px;
  cursor: pointer;
  border: none;
  font-weight: 500;
`;

const PrimaryButton = styled(Button)`
  background-color: #333;
  color: #fff;
`;

const OutlineButton = styled(Button)`
  background-color: #fff;
  color: #333;
  border: 1px solid #ddd;
`;

const StyledEditorContent = styled(TiptapEditorContent)`
  .ProseMirror {
    min-height: 400px;
    padding: 15px;
    outline: none;
    border: none;
    font-size: 15px;
    line-height: 1.6;
    color: #333;

    s, del {
      text-decoration: line-through;
      text-decoration-thickness: 2px;
      text-decoration-color: #333;
      text-decoration-skip-ink: none;
    }

    u {
      text-decoration: underline;
      text-decoration-thickness: 1.5px;
      text-underline-offset: 2px;
    }

    &:focus {
      outline: none;
    }
  }
`;

// 툴바의 select 공통 스타일
const Select = styled.select`
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  font-size: 14px;
  cursor: pointer;
`

// 색상 입력 (color picker)
const ColorInput = styled.input.attrs({ type: 'color' })`
  width: 32px;
  height: 32px;
  border: none;
  padding: 0;
  cursor: pointer;
`

// 파일 업로드용 숨긴 input
const HiddenFileInput = styled.input.attrs({ type: 'file', accept: 'image/*' })`
  display: none;
`

// 이미지 삽입 전용 (에디터 툴바)
const HiddenImageInput = styled.input.attrs({ type: 'file', accept: 'image/*' })`
  display: none;
`

// 일반 첨부파일 전용 (폼 아래)
const HiddenAttachmentInput = styled.input.attrs({ type: 'file' })`
  display: none;
`

// 파일 업로드 레이블
const UploadLabel = styled.label`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #555;
  &:hover {
    background-color: #eee;
  }
  i {
    margin-right: 6px;
  }
`
const ResizeUI = styled.div`
  position: absolute;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  z-index: 1000;
  padding: 6px 10px;
  display: flex;
  gap: 8px;
`;

const ResizeButton = styled.button`
  font-size: 13px;
  padding: 4px 8px;
  cursor: pointer;
`;
// #endregion

const MAX_FILES = 5;    // 최대 파일 개수

const PostEditor = () => {
    const navigate = useNavigate();
    const { postId } = useParams();
    const isEdit = !!postId;

    const { categories, selectedCategory, setSelectedCategory, fetchCategories } = useCategoryStore();
    const [imageResizeUI, setImageResizeUI] = useState({ visible: false, top: 0, left: 0, pos: null });
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [formData, setFormData] = useState({
        title: "",
        categoryCode: "",
        categoryName: "",
        attachments: [],
    });
    const [content, setContent] = useState('');

    const existingCount = formData.attachments.length;  // 기존에 존재하는 파일 개수(edit용)
    const totalCount = existingCount + selectedFiles.length;    // 총 파일 개수
    const remainingSlots = MAX_FILES - totalCount;   // 추가 가능한 파일 개수
    const [deletedAttachmentIds, setDeletedAttachmentIds] = useState([]);   // 삭제 파일

    const [needCaptcha, setNeedCaptcha] = useState(false);

    const titleRef = useRef();

    const fetchPost = async (id) => {
        const data = await postAPI.getPostForEdit(id);

        setFormData({
            title: data.title,
            categoryCode: data.categoryCode,
            categoryName: data.categoryName,
            attachments: data.attachments,
        });

        if (editor) {
            editor.commands.setContent(data.content);
            setContent(data.content);
        }
    };

    // 텍스트 에디터 글씨 크기 설정
    const FontSize = Mark.create({
        name: 'fontSize',

        addOptions() {
            return {
                HTMLAttributes: {},
            };
        },

        addAttributes() {
            return {
                fontSize: {
                    default: null,
                    parseHTML: element => element.style.fontSize?.replace('px', '') || null,
                    renderHTML: attributes => {
                        const style = [];

                        if (attributes.fontSize) {
                            style.push(`font-size: ${attributes.fontSize}px`);
                        }
                        if (attributes.textDecoration) {
                            style.push(`text-decoration: ${attributes.textDecoration}`);
                        }

                        return {
                            style: style.join('; '),
                        };
                    },
                },
                textDecoration: {
                    default: null,
                    parseHTML: element => element.style.textDecoration || null,
                },
            };
        },

        renderHTML({ HTMLAttributes }) {
            return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
        },

        addCommands() {
            return {
                setFontSize: fontSize => ({ commands }) =>
                    commands.setMark(this.name, { fontSize }),

                setFontSizeWithStrike: fontSize => ({ chain }) =>
                    chain()
                        .setMark(this.name, {
                            fontSize,
                            textDecoration: 'line-through',
                        })
                        .run(),
            };
        },
    });

    // 텍스트 에디터 설정
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle, // <- 글자 스타일 기반 확장
            Color,     // <- 글자 색상
            Underline,
            FontSize,
            TextAlign.configure({
                types: ['heading', 'paragraph'], // 정렬 가능한 노드
            }),
            Image.extend({
                addAttributes() {
                    return {
                        src: {},
                        width: {
                            default: 'auto',
                            parseHTML: element => element.getAttribute('width') || element.style.width || 'auto',
                            renderHTML: attributes => {
                                const attrs = {};
                                if (attributes.width) {
                                    attrs.style = `width: ${attributes.width};`;
                                    attrs.width = attributes.width;
                                }
                                return attrs;
                            },
                        },
                    };
                },
            })
        ],
        content: '',
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
        },
    });

    // 사진 리사이즈 UI 클릭 이벤트
    const handleResizeClick = (width) => {
        if (!editor) return;

        editor
            .chain()
            .focus()
            .updateAttributes('image', { width })
            .run();

        setImageResizeUI({ visible: false, top: 0, left: 0, pos: null });
    };

    // 텍스트 에디터 툴바 클릭 이벤트
    const handleToolbarClick = (action) => {
        if (!editor) return;

        switch (action) {
            case 'bold':
                editor.chain().focus().toggleBold().run();
                break;
            case 'italic':
                editor.chain().focus().toggleItalic().run();
                break;
            case 'underline':
                editor.chain().focus().toggleUnderline().run();
                break;
            case 'strike': {
                const fontSize = editor.getAttributes('fontSize')?.fontSize || null;
                if (fontSize) {
                    editor.chain().focus().setFontSizeWithStrike(fontSize).run();
                } else {
                    editor.chain().focus().toggleStrike().run();
                }
                break;
            }
            case 'heading':
                editor.chain().focus().toggleHeading({ level: 2 }).run();
                break;
            case 'list-ul':
                editor.chain().focus().toggleBulletList().run();
                break;
            case 'list-ol':
                editor.chain().focus().toggleOrderedList().run();
                break;
            case 'blockquote':
                editor.chain().focus().toggleBlockquote().run();
                break;
            default:
                break;
        }
    };

    // 게시글 submit 핸들러
    const submitPost = async (captcha) => {
        const contentHTML = editor.getHTML();

        // 썸네일용 첫 번째 이미지 추출
        const match = contentHTML.match(/<img[^>]+src="([^">]+)"/);
        const thumbnailUrl = match?.[1] ?? null;

        try {
            const formDataObj = new FormData();

            let dto;
            if (isEdit) {
                dto = {
                    title: formData.title,
                    content: editor.getHTML(),
                    thumbnailUrl,
                    deleteAttachmentIds: deletedAttachmentIds,
                };
            } else {
                dto = {
                    categoryId: selectedCategory.id,
                    title: formData.title,
                    content: editor.getHTML(),
                    thumbnailUrl,
                    captchaToken: captcha,
                };
            }

            formDataObj.append(
                "dto",
                new Blob([JSON.stringify(dto)], { type: "application/json" })
            );

            selectedFiles.forEach(file => {
                formDataObj.append("attachments", file);
            });

            if (isEdit) {
                await postAPI.update(postId, formDataObj);
                setDeletedAttachmentIds([]);
                navigate(`/community/post/${postId}`);
            } else {
                const newId = await postAPI.create(formDataObj);
                setDeletedAttachmentIds([]);
                navigate(`/community/post/${newId}`);
            }

        } catch (err) {
            console.error("게시글 등록 실패", err);
            alert("게시글 등록에 실패했습니다.");
        }
    };


    // 스팸 체크 후 필요하면 캡챠 띄우고, 아닐 땐 바로 submitPost 호출
    const handleCheckThenSubmit = async (e) => {
        if (e) e.preventDefault();

        const contentHTML = editor.getHTML();

        if (!formData.title.trim()) {
            alert("제목을 입력해주세요.");
            titleRef.current?.focus();
            return;
        }

        if (!isEdit && !selectedCategory.id) {
            alert("카테고리를 선택해주세요.");
            return;
        }

        if (!contentHTML || contentHTML === '<p></p>') {
            alert("내용을 입력해주세요.");
            editor?.commands.focus();
            return;
        }

        try {
            if (!isEdit) {
                const isSuspicious = await spamCheckAPI.check({
                    type: "POST",
                    title: formData.title,
                    content: contentHTML,
                });

                if (isSuspicious) {
                    setNeedCaptcha(true);
                    return;
                }
            }

            submitPost(null);
        } catch (err) {
            console.error("게시글 등록 실패", err);
            alert("게시글 등록에 실패했습니다.");
        }
    };

    useEffect(() => {
        // 카테고리가 비어 있다면 서버에서 다시 불러옴
        if (categories.length === 0) {
            fetchCategories();
        }
    }, []);

    // postId로 게시글 불러오기
    useEffect(() => {
        if (isEdit) {
            fetchPost(postId);
        }
    }, [postId]);

    // 사진 리사이즈
    useEffect(() => {
        if (!editor) return;
        editor.commands.focus();
        const handleClick = (event) => {
            const el = event.target;
            if (el.tagName === 'IMG') {
                const pos = editor.view.posAtDOM(el);
                // 클릭 위치로 UI 이동
                setImageResizeUI({
                    visible: true,
                    top: event.pageY,
                    left: event.pageX,
                    pos,
                });
            } else {
                setImageResizeUI({ visible: false, top: 0, left: 0, pos: null });
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [editor]);


    return (
        <Container>
            <WriteForm onSubmit={handleCheckThenSubmit}>
                <FormHeader>
                    <h1>{isEdit ? "게시글 수정하기" : "게시글 작성하기"}</h1>
                    <p>여러분의 생각을 자유롭게 작성해주세요. 건전한 토론 문화를 만들어갑니다.</p>
                </FormHeader>

                <FormGroup>
                    <Label htmlFor="title">제목</Label>
                    <Input
                        id="title"
                        ref={titleRef}
                        placeholder="제목을 입력해주세요"
                        value={formData.title}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, title: e.target.value }))
                        }
                    />
                </FormGroup>


                {isEdit ? (
                    <FormGroup>
                        <Label>카테고리</Label>
                        <CategorySelect>
                            <CategoryItem className="active" $readonly={true}>
                                {formData.categoryName}
                            </CategoryItem>
                        </CategorySelect>
                    </FormGroup>
                ) : (
                    <FormGroup>
                        <Label>카테고리 선택</Label>
                        <CategorySelect>
                            {categories.filter((category) => category.code !== "notice").map((category) => (
                                <CategoryItem
                                    key={category.id}
                                    className={selectedCategory?.code === category.code ? "active" : ""}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category.name}
                                </CategoryItem>
                            ))}
                        </CategorySelect>
                    </FormGroup>
                )}

                <FileUpload>
                    <Label>파일 첨부</Label>
                    <FileButton disabled={remainingSlots <= 0}>
                        <i>📎</i> 파일 선택하기
                        <HiddenAttachmentInput
                            id="file-upload"
                            multiple
                            disabled={remainingSlots <= 0}
                            onChange={(e) => {
                                const maxSize = Number(process.env.REACT_APP_MAX_FILE_SIZE_MB || 10) * 1024 * 1024;
                                const maxNameLength = 50;

                                const files = Array.from(e.target.files || []);

                                // 파일 이름 길이·크기 검사
                                const tooLong = files.filter(file => file.name.length > maxNameLength);
                                const tooBig = files.filter(file => file.size > maxSize);
                                let validFiles = files.filter(file => file.name.length <= maxNameLength && file.size <= maxSize);

                                // 추가 가능한 파일 수 만큼만 자르기
                                validFiles = validFiles.slice(0, remainingSlots);

                                // 상태 업데이트
                                setSelectedFiles(prev => [...prev, ...validFiles]);

                                // 알림
                                if (tooLong.length > 0) {
                                    alert(`파일 이름은 최대 ${maxNameLength}자까지만 가능합니다.`);
                                }
                                if (tooBig.length > 0) {
                                    alert(`파일 크기는 최대 ${process.env.REACT_APP_MAX_FILE_SIZE_MB || 10}MB까지만 업로드할 수 있습니다.`);
                                }
                                if (validFiles.length < files.length - tooLong.length - tooBig.length)
                                    alert(`최대 ${remainingSlots}개까지만 선택할 수 있습니다.`);

                                e.target.value = "";
                            }}
                        />
                    </FileButton>

                    {(formData.attachments.length > 0 || selectedFiles.length > 0) && (
                        <FileList>
                            {formData.attachments.map((file, i) => (
                                <FileItem key={`old-${i}`}>
                                    • {file.name}
                                    <RemoveButton
                                        type="button"
                                        onClick={() => {
                                            const removed = formData.attachments[i];

                                            setDeletedAttachmentIds(prev => [...prev, removed.id]);

                                            setFormData(prev => ({
                                                ...prev,
                                                attachments: prev.attachments.filter((_, idx) => idx !== i)
                                            }))
                                        }}>✕
                                    </RemoveButton>
                                </FileItem>
                            ))}

                            {selectedFiles.map((file, i) => (
                                <FileItem key={`new-${i}`}>
                                    <FileName>• {file.name}</FileName>
                                    <RemoveButton
                                        type="button"
                                        onClick={() =>
                                            setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))
                                        }
                                    >
                                        ✕
                                    </RemoveButton>
                                </FileItem>
                            ))}
                            {(existingCount + selectedFiles.length) >= MAX_FILES && (
                                <FileLimitNotice>※ 최대 5개 파일까지만 선택할 수 있습니다.</FileLimitNotice>
                            )}
                        </FileList>
                    )}
                </FileUpload>

                <EditorContainer>
                    <EditorToolbar>
                        {[
                            ['bold', '굵게'],
                            ['italic', '기울임'],
                            ['underline', '밑줄'],
                            ['strike', '취소선'],
                            ['heading', '제목'],
                        ].map(([key, label]) => (
                            <ToolbarButton type="button" key={key} onClick={() => handleToolbarClick(key)}>
                                {label}
                            </ToolbarButton>
                        ))}
                        <Select onChange={e => editor.chain().focus().setFontSize(+e.target.value).run()} defaultValue="">
                            <option value="" disabled>글자 크기</option>
                            {[11, 13, 15, 16, 19, 24, 28, 30, 34, 38].map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>


                        <ColorInput
                            onChange={e => editor.chain().focus().setColor(e.target.value).run()}
                            title="글자 색상 선택"
                        />

                        <Select onChange={e => editor.chain().focus().setTextAlign(e.target.value).run()} defaultValue="">
                            <option value="" disabled>정렬</option>
                            <option value="left">왼쪽</option>
                            <option value="center">가운데</option>
                            <option value="right">오른쪽</option>
                            <option value="justify">양쪽</option>
                        </Select>

                        <UploadLabel>
                            <i>📁</i>
                            <HiddenImageInput
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file || !editor) return;

                                    try {
                                        const url = await fileAPI.upload("post_images", file); // GCS 업로드 후 URL 받아옴
                                        editor.chain().focus().setImage({ src: url, width: '100%' }).run(); // 에디터에 이미지 삽입
                                    } catch (err) {
                                        console.error("이미지 업로드 실패", err);
                                        alert("이미지 업로드에 실패");
                                    }
                                }}
                            />
                            이미지 추가
                        </UploadLabel>
                    </EditorToolbar>

                    <StyledEditorContent editor={editor} spellCheck={false} />
                    {imageResizeUI.visible && (
                        <ResizeUI style={{ top: imageResizeUI.top, left: imageResizeUI.left }}>
                            {['25%', '50%', '100%'].map(size => (
                                <ResizeButton key={size} onClick={() => handleResizeClick(size)}>
                                    {size}
                                </ResizeButton>
                            ))}
                        </ResizeUI>
                    )}
                </EditorContainer>

                <ButtonGroup>
                    <OutlineButton type="button" onClick={() => navigate(-1)}>취소</OutlineButton>
                    <PrimaryButton type="submit">{isEdit ? "수정하기" : "게시하기"}</PrimaryButton>
                </ButtonGroup>
            </WriteForm>

            <ReCaptchaModal
                visible={needCaptcha}
                onVerify={(token) => {
                    setNeedCaptcha(false);
                    submitPost(token);
                }}
                onClose={() => setNeedCaptcha(false)}
            />
        </Container >
    );
};

export default PostEditor;