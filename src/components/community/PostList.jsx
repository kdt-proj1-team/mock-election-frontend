import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import usePageStore from "../../store/pageStore";
import styled from "styled-components";
import { FaSearch } from "react-icons/fa";
import useCategoryStore from "../../store/categoryStore";
import { postAPI } from "../../api/PostApi";
import { formatPostTimeSmart } from "../../utils/DateFormatter";

// #region styled-components
const Section = styled.section`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 40px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
`;

const CategoryLabel = styled.div`
  padding-left: 3px;
  font-size: 20px;
  font-weight: 600;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const Select = styled.select`
  padding: 8px 8px;
  border: 1px solid #e1e1e1;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
`;

const SearchBox = styled.div`
  display: flex;
  border: 1px solid #e1e1e1;
  border-radius: 4px;
  overflow: hidden;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: none;
  width: 200px;
  font-size: 14px;
`;

const SearchButton = styled.button`
  background-color: white;
  border: none;
  border-left: 1px solid #e1e1e1;
  padding: 0 12px;
  cursor: pointer;
`;

const WriteButton = styled.button`
  background-color: ${({ theme }) => theme.colors.dark};
  color: white;
  border: none;
  padding: 8px 16px;
  margin-left: 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
`;

const Table = styled.div`
  width: 100%;
`;

const TableHeader = styled.div`
  display: flex;
  background-color: #f5f6f7;
  font-weight: 700;
  font-size: 14px;
  border-bottom: 1px solid #e1e1e1;
`;

const TableRow = styled.div`
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
  &:hover {
    background-color: #f9f9f9;
  }
  &.notice {
    background-color: #f8f9ff;
  }
`;

const Column = styled.div`
  padding: 14px 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
`;

const Num = styled(Column)`
  flex: 0 0 80px;
  text-align: center;
`;

const Category = styled(Column)`
  flex: 0 0 100px;
  text-align: center;
`;

const Title = styled(Column)`
  flex: 1;
  
  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      font-weight: bold;
    }
  }
`;

const Author = styled(Column)`
  flex: 0 0 120px;
  text-align: center;
`;

const DateCol = styled(Column)`
  flex: 0 0 150px;
  text-align: center;
`;

const View = styled(Column)`
  flex: 0 0 80px;
  text-align: center;
`;

const NoticeTag = styled.span`
  display: inline-block;
  background-color: #888;
  color: white;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 10px;
  font-weight: 700;
  line-height: 1;
`;

const CommentCount = styled.span`
  color: #888;
  font-size: 12px;
  position: relative;
  top: -1px;
  font-weight: normal !important;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  gap: 5px;
`;

const PageButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 30px;
  padding: 0 5px;
  border-radius: 4px;
  text-decoration: none;
  color: #666;
  font-size: 14px;
  background-color: ${(props) => (props.active ? props.theme.colors.secondary : "transparent")};
  color: ${(props) => (props.active ? "white" : "#666")};
  font-weight: ${(props) => (props.active ? 700 : 400)};
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
    color: #666666;
  }
`;

const NoData = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 15px;
`;
// #endregion

const PostList = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCategory } = useCategoryStore();

  const [posts, setPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState(null); // 임시 저장
  const [pendingCategoryCode, setPendingCategoryCode] = useState(null);
  const { page, setPage, resetPage } = usePageStore();
  const [totalPages, setTotalPages] = useState(1);
  const searchRef = useRef(null);
  const [searchType, setSearchType] = useState("title_content"); // 기본값: 제목 + 내용
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get("search") || "");


  useEffect(() => {
    const raw = parseInt(searchParams.get("page"));
    const urlPage = isNaN(raw) || raw < 1 ? null : raw - 1;

    if (urlPage !== null) {
      setPage(urlPage); // URL 우선
    } else {
      // page 쿼리 없거나 잘못된 경우 → store 값 사용해서 URL 설정
      searchParams.set("page", page + 1);
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedCategory) return;
    const fetchPosts = async () => {
      if (!selectedCategory) return;
      try {
        const data = await postAPI.getPostsByCategory(
          selectedCategory.code,
          page,
          10, // 10은 페이지 당 게시글 수
          searchParams.get("searchType") || "title_content",
          searchParams.get("search") || ""
        );
        setPendingPosts(data.content);                 // 임시 저장
        setTotalPages(data.totalPages);
        setPendingCategoryCode(selectedCategory.code); // 어떤 카테고리용인지 기억
      } catch (err) {
        console.error("게시글 목록 조회 실패", err);
      }
    };

    fetchPosts();

  }, [selectedCategory, page, searchParams]);

  useEffect(() => {
    if (pendingCategoryCode === selectedCategory?.code && pendingPosts) {
      setPosts(pendingPosts);
      setPendingPosts(null);
    }
  }, [pendingPosts, pendingCategoryCode, selectedCategory]);

  const handlePageClick = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      // store 업데이트
      setPage(newPage);

      // URL 반영
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", newPage + 1);
      setSearchParams(newParams);

      const offset = 90;
      const top = searchRef.current?.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top });
    }
  };

  // 검색 핸들러
  const handleSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", 1); // 검색 시 1페이지로
    newParams.set("searchType", searchType);
    newParams.set("search", searchKeyword);
    setSearchParams(newParams);
    resetPage(); // store 초기화
  };

  return (
    <Section>
      <Header>
        <CategoryLabel>{selectedCategory?.name}</CategoryLabel>

        <Controls>
          <Select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
            <option value="title_content">제목 + 내용</option>
            <option value="title">제목</option>
            <option value="content">내용</option>
            <option value="author">작성자</option>
          </Select>

          <SearchBox ref={searchRef}>
            <SearchInput placeholder="검색어를 입력하세요"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <SearchButton onClick={handleSearch}>
              <FaSearch />
            </SearchButton>
          </SearchBox>
          <WriteButton onClick={() => {
            if (!userId) {
              if (window.confirm("로그인 후 이용 가능한 기능입니다.\n로그인하시겠습니까?")) {
                navigate("/login");
              }
              return;
            } else {
              navigate("/community/board/write")
            }
          }}>글쓰기</WriteButton>
        </Controls>
      </Header>

      <Table>
        <TableHeader>
          <Num>번호</Num>
          <Category>카테고리</Category>
          <Title>제목</Title>
          <Author>작성자</Author>
          <DateCol>날짜</DateCol>
          <View>조회</View>
        </TableHeader>

        {
          posts.map((post) => (
            <TableRow key={post.id} className={post.notice ? "notice" : ""}>
              <Num>
                {post.categoryName === "공지사항" ? (
                  <NoticeTag>공지</NoticeTag>
                ) : (
                  post.id
                )}
              </Num>
              <Category>{post.categoryName}</Category>
              <Title>
                <Link to={`/community/post/${post.id}`}>
                  {post.title} {post.commentCount > 0 && <CommentCount>[{post.commentCount}]</CommentCount>}
                </Link>
              </Title>
              <Author>{post.authorNickname}</Author>
              <DateCol>{formatPostTimeSmart(post.createdAt)}</DateCol>
              <View>{post.views}</View>
            </TableRow>
          ))
        }

        {posts.length === 0 && pendingPosts === null && (
          <NoData>검색 결과가 없습니다.</NoData>
        )}
      </Table>

      <Pagination>
        {/* 현재 페이지 기준으로 블록 계산 */}
        {(() => {
          const pageSize = 10; // 블록당 페이지 수
          const currentBlock = Math.floor(page / pageSize);
          const startPage = currentBlock * pageSize;
          const endPage = Math.min(startPage + pageSize, totalPages);

          return (
            <>
              {/* 이전 블록 화살표 */}
              {startPage > 0 && (
                <PageButton onClick={() => handlePageClick(startPage - 1)}>
                  &lt;
                </PageButton>
              )}

              {/* 현재 블록 내 페이지 번호 */}
              {Array.from({ length: endPage - startPage }, (_, i) => {
                const pageIndex = startPage + i;
                return (
                  <PageButton
                    key={pageIndex}
                    onClick={() => handlePageClick(pageIndex)}
                    active={pageIndex === page}
                  >
                    {pageIndex + 1}
                  </PageButton>
                );
              })}

              {/* 다음 블록 화살표 */}
              {endPage < totalPages && (
                <PageButton onClick={() => handlePageClick(endPage)}>
                  &gt;
                </PageButton>
              )}
            </>
          );
        })()}
      </Pagination>
    </Section>
  );
};

export default PostList;
