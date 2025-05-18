import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import styled from "styled-components";
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

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #e1e1e1;
  border-radius: 4px;
  font-size: 14px;
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
      text-decoration: underline;
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
  background-color: #ff6b6b;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 700;
`;

const CommentCount = styled.span`
  color: #3182f6;
  font-size: 12px;
`;

const NewTag = styled.span`
  display: inline-block;
  background-color: #ff6b6b;
  color: white;
  font-size: 11px;
  padding: 1px 4px;
  border-radius: 4px;
  margin-left: 5px;
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCategory } = useCategoryStore();

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const searchRef = useRef(null);

  useEffect(() => {
    const rawPage = parseInt(searchParams.get("page"));
    const safePage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

    // page 상태 동기화
    setPage(safePage - 1);

    // URL 정정도 여기서 같이 처리
    if (safePage !== rawPage) {
      searchParams.set("page", safePage);
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      searchParams.set("page", "1");
      setSearchParams(searchParams, { replace: true });
      setPage(0);
    }

    const fetchPosts = async () => {
      try {
        const data = await postAPI.getPostsByCategory(selectedCategory.code, page, 10); // 10은 페이지 당 게시글 수
        setPosts(data.content);
        setTotalPages(data.totalPages);

      } catch (err) {
        console.error("게시글 목록 조회 실패", err);
      }
    };

    if (selectedCategory) {
      fetchPosts();
    }
  }, [selectedCategory, page]);


  const handlePageClick = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      searchParams.set("page", newPage + 1); // URL에선 1부터 시작
      setSearchParams(searchParams);

      const offset = 90;
      const top = searchRef.current?.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top });
    }
  };


  return (
    <Section>
      <Header>
        <Controls>
          <SearchBox ref={searchRef}>
            <SearchInput placeholder="검색어를 입력하세요" />
            <SearchButton>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </SearchButton>
          </SearchBox>
        </Controls>
        <WriteButton onClick={() => navigate("/community/board/write")}>글쓰기</WriteButton>
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

        {posts.length === 0 ? (
          <NoData>게시글이 없습니다.</NoData>
        ) : (
          posts.map((post) => (
            <TableRow key={post.id} className={post.notice ? "notice" : ""}>
              <Num>{post.id}</Num>
              <Category>{post.categoryName}</Category>
              <Title>
                <Link to={`/community/post/${post.id}`}>
                  {post.title} {post.commentCount > 0 && <CommentCount>[{post.commentCount}]</CommentCount>}
                  {post.isNew && <NewTag>N</NewTag>}
                </Link>
              </Title>
              <Author>{post.authorNickname}</Author>
              <DateCol>{formatPostTimeSmart(post.createdAt)}</DateCol>
              <View>{post.views}</View>
            </TableRow>
          ))
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
