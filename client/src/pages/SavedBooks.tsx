import { useQuery, useMutation } from "@apollo/client";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import { GET_ME } from "../utils/queries";
import { REMOVE_BOOK } from "../utils/mutations";
import Auth from "../utils/auth";
import { removeBookId } from "../utils/localStorage";

const SavedBooks = () => {
  const { loading, data } = useQuery(GET_ME);
  const userData = data?.me || {};

  const [removeBook] = useMutation(REMOVE_BOOK, {
    refetchQueries: [{ query: GET_ME }],
  });

  const handleDeleteBook = async (bookId: string) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    if (!token) return false;

    try {
      await removeBook({ variables: { bookId } });
      removeBookId(bookId);
    } catch (err) {
      console.error("Error deleting book:", err);
    }
  };

  if (loading) return <h2>Loading...</h2>;

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Viewing {userData.username ? `${userData.username}'s` : ""} saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className="pt-5">
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? "book" : "books"
              }:`
            : "You have no saved books!"}
        </h2>
        <Row className="mt-4">
          {userData.savedBooks.map((book) => (
            <Col md={4} key={book.bookId} className="mb-4">
              <Card className="h-100 shadow-sm border-dark">
                {book.image && (
                  <Card.Img
                    src={book.image}
                    alt={`Cover of ${book.title}`}
                    className="card-img-top"
                  />
                )}
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="text-center mb-3">{book.title}</Card.Title>
                  <p className="text-muted small text-center">Authors: {book.authors}</p>
                  <Card.Text className="flex-grow-1">{book.description}</Card.Text>
                  <Button
                    className="btn-block btn-danger"
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
