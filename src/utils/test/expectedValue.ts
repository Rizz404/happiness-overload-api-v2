import { Response } from "supertest";

export const expectedUser = (
  response: Response,
  user: {
    _id: string;
    username: string;
    email: string;
    roles: string;
    isOauth: boolean;
  }
) => {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    roles: user.roles,
    ...(response.body.fullname && { fullname: expect.any(String) }),
    isOauth: user.isOauth,
    lastLogin: expect.anything(),
    ...(response.body.profilePict && { profilePict: expect.any(String) }),
    ...(response.body.phoneNumber && { phoneNumber: expect.any(Number) }),
    createdAt: expect.anything(),
    updatedAt: expect.anything(),
  };
};

export const expectedPost = (response: Response | any) => {
  return {
    _id: expect.any(String),
    userId: expect.any(Object),
    title: expect.any(String),
    tags: expect.arrayContaining(expect.any(Object)),
    ...(response.images && { images: expect.arrayContaining(expect.any(String)) }),
    ...(response.description && { description: expect.any(String) }),
    commentsCount: expect.any(Number),
    upvotes: {
      count: expect.any(Number),
    },
    downvotes: {
      count: expect.any(Number),
    },
    createdAt: expect.anything(),
    updatedAt: expect.anything(),
  };
};

export const expectedTag = (response: Response) => {
  return {
    _id: expect.any(String),
    name: expect.any(String),
    posts: expect.arrayContaining(expect.objectContaining(expectedPost(response))),
    description: expect.any(String),
    createdAt: expect.anything(),
    updatedAt: expect.anything(),
  };
};

export const expectedDate = (response: Response) => {
  expect(new Date(response.body.lastLogin)).toBeInstanceOf(Date);
  expect(new Date(response.body.createdAt)).toBeInstanceOf(Date);
  expect(new Date(response.body.updatedAt)).toBeInstanceOf(Date);
};

export const expectedPagination = () => {
  return {
    currentPage: expect.any(Number),
    dataPerPage: expect.any(Number),
    totalData: expect.any(Number),
    totalPages: expect.any(Number),
    hasNextPage: expect.any(Boolean),
  };
};

export const expectedLinks = () => {
  return {
    previous: null,
    next: null,
  };
};
