/* global describe, it, before */
/**
 * Mocha test of Project 3 web API with login functionality. Run using this command:
 *   node_modules/.bin/mocha serverApiTest.js
 */

import assert from "assert";
import http from "http";
// eslint-disable-next-line import/no-extraneous-dependencies
import async from "async";
import _ from "lodash";
import fs from "fs";
import models from "../modelData/photoApp.js";

const port = 3001;
const host = "localhost";

/** Plaintext for seeded users; matches bcrypt digest in loadDatabase.js */
const SEEDED_LOGIN_PASSWORD = "password";

// Valid properties of a user list model
const userListProperties = ["first_name", "last_name", "_id"];
// Valid properties of a user detail model
const userDetailProperties = [
  "first_name",
  "last_name",
  "_id",
  "location",
  "description",
  "occupation",
];
// Valid properties of the photo model
const photoProperties = ["file_name", "date_time", "user_id", "_id", "comments", "likes"];
// Valid comments properties
const commentProperties = ["comment", "date_time", "_id", "user"];

function assertEqualDates(d1, d2) {
  assert(new Date(d1).valueOf() === new Date(d2).valueOf());
}

/**
 * MongoDB automatically adds some properties to our models. We allow these to
 * appear by removing them when before checking for invalid properties. This way
 * the models are permitted but not required to have these properties.
 */
function removeMongoProperties(model) {
  return model;
}

describe("Photo App: Server API Tests", function () {
  let authCookie; // Session cookie from login request
  let sessionUser;

  describe("test using model data", function () {
    it("webServer does not import model data", function (done) {
      fs.readFile("../Backend/webServer.js", function (err, data) {
        if (err) throw err;
        const src = data.toString();
        assert(
          !src.includes("modelData/photoApp"),
          "webServer must not import modelData/photoApp.js"
        );
        done();
      });
    });
  });

  describe("login the user took", function () {
    it("can login took with a post to /admin/login", function (done) {
      const postBody = JSON.stringify({
        login_name: "took",
        password: SEEDED_LOGIN_PASSWORD,
      });

      const options = {
        hostname: host,
        port: port,
        path: "/admin/login",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": postBody.length,
        },
      };

      const request = http.request(options, function (response) {
        let responseBody = "";
        response.on("data", function (chunk) {
          responseBody += chunk;
        });

        response.on("end", function () {
          assert.strictEqual(
            response.statusCode,
            200,
            "HTTP response status code not OK"
          );
          sessionUser = JSON.parse(responseBody);
          // If express-session middleware was enabled we should have a
          // 'set-cookie' response header with the Express session cookie. We
          // assume it will be the first (and only) cookie.
          authCookie = response.headers["set-cookie"] && response.headers["set-cookie"][0];
          // Keep only the cookie name=value pair (strip attributes like Path, HttpOnly)
          if (authCookie && authCookie.includes(';')) {
            authCookie = authCookie.split(';')[0];
          }
          done();
        });
      });

      request.write(postBody);
      request.end();
    });

    it("can retrieve the Express session cookie", function (done) {
      assert(authCookie, "found a session cookie in the login POST response");
      assert(
        authCookie.match(/^connect\.sid=/),
        "looks like an Express cookie"
      );
      done();
    });
  });

  describe("test /user/list", function () {
    let userList;
    const Users = models.userListModel();

    it("can get the list of user", function (done) {
      http.get(
        {
          hostname: host,
          port: port,
          path: "/user/list",
          headers: { Cookie: authCookie },
        },
        function (response) {
          let responseBody = "";
          response.on("data", function (chunk) {
            responseBody += chunk;
          });

          response.on("end", function () {
            assert.strictEqual(
              response.statusCode,
              200,
              "HTTP response status code not OK"
            );
            userList = JSON.parse(responseBody);
            done();
          });
        }
      );
    });

    it("is an array", function (done) {
      assert(Array.isArray(userList));
      done();
    });

    it("has the correct number elements", function (done) {
      assert.strictEqual(
        userList.length,
        Users.length,
        "Wrong number of users. Did you forget to run loadDatabase.js?"
      );
      done();
    });

    it("has an entry for each of the users", function (done) {
      async.each(
        Users,
        function (realUser, callback) {
          const user = _.find(userList, {
            first_name: realUser.first_name,
            last_name: realUser.last_name,
          });
          assert(
            user,
            "could not find user " +
              realUser.first_name +
              " " +
              realUser.last_name
          );
          assert.strictEqual(
            _.countBy(userList, "_id")[user._id],
            1,
            "Multiple users with id:" + user._id
          );
          const extraProps = _.difference(
            Object.keys(removeMongoProperties(user)),
            userListProperties
          );
          assert.strictEqual(
            extraProps.length,
            0,
            "user object has extra properties: " + extraProps
          );
          callback();
        },
        done
      );
    });
  });

  describe("test /user/:id", function () {
    let userList;
    const Users = models.userListModel();

    it("can get the list of user", function (done) {
      http.get(
        {
          hostname: host,
          port: port,
          path: "/user/list",
          headers: { Cookie: authCookie },
        },
        function (response) {
          let responseBody = "";
          response.on("data", function (chunk) {
            responseBody += chunk;
          });

          response.on("end", function () {
            assert.strictEqual(
              response.statusCode,
              200,
              "HTTP response status code not OK"
            );
            userList = JSON.parse(responseBody);
            done();
          });
        }
      );
    });

    it("can get each of the user detail with /user/:id", function (done) {
      async.each(
        Users,
        function (realUser, callback) {
          const user = _.find(userList, {
            first_name: realUser.first_name,
            last_name: realUser.last_name,
          });
          assert(
            user,
            "could not find user " +
              realUser.first_name +
              " " +
              realUser.last_name
          );
          let userInfo;
          const id = user._id;
          http.get(
            {
              hostname: host,
              port: port,
              path: "/user/" + id,
              headers: { Cookie: authCookie },
            },
            function (response) {
              let responseBody = "";
              response.on("data", function (chunk) {
                responseBody += chunk;
              });

              response.on("end", function () {
                userInfo = JSON.parse(responseBody);
                assert.strictEqual(userInfo._id, id);
                assert.strictEqual(userInfo.first_name, realUser.first_name);
                assert.strictEqual(userInfo.last_name, realUser.last_name);
                assert.strictEqual(userInfo.location, realUser.location);
                assert.strictEqual(userInfo.description, realUser.description);
                assert.strictEqual(userInfo.occupation, realUser.occupation);

                const extraProps = _.difference(
                  Object.keys(removeMongoProperties(userInfo)),
                  userDetailProperties
                );
                assert.strictEqual(
                  extraProps.length,
                  0,
                  "user object has extra properties: " + extraProps
                );
                callback();
              });
            }
          );
        },
        done
      );
    });

    it("can return a 400 status on an invalid user id", function (done) {
      http.get(
        {
          hostname: host,
          port: port,
          path: "/user/1",
          headers: { Cookie: authCookie },
        },
        function (response) {
          response.on("data", function () {});
          response.on("end", function () {
            assert.strictEqual(response.statusCode, 400);
            done();
          });
          response.on("error", function (err) {
            done(err);
          });
        }
      ).on("error", function (err) {
        done(err);
      });
    });
  });

  describe("test /photosOfUser/:id", function () {
    let userList;
    const Users = models.userListModel();

    it("can get the list of user", function (done) {
      http.get(
        {
          hostname: host,
          port: port,
          path: "/user/list",
          headers: { Cookie: authCookie },
        },
        function (response) {
          let responseBody = "";
          response.on("data", function (chunk) {
            responseBody += chunk;
          });

          response.on("end", function () {
            assert.strictEqual(
              response.statusCode,
              200,
              "HTTP response status code not OK"
            );
            userList = JSON.parse(responseBody);
            done();
          });
        }
      );
    });

    it("can get each of the user photos with /photosOfUser/:id", function (done) {
      async.each(
        Users,
        function (realUser, callback) {
          // validate the the user is in the list once
          const user = _.find(userList, {
            first_name: realUser.first_name,
            last_name: realUser.last_name,
          });
          assert(
            user,
            "could not find user " +
              realUser.first_name +
              " " +
              realUser.last_name
          );
          let photos;
          const id = user._id;
          http.get(
            {
              hostname: host,
              port: port,
              path: "/photosOfUser/" + id,
              headers: { Cookie: authCookie },
            },
            function (response) {
              let responseBody = "";
              response.on("data", function (chunk) {
                responseBody += chunk;
              });
              response.on("error", function (err) {
                callback(err);
              });

              response.on("end", function () {
                assert.strictEqual(
                  response.statusCode,
                  200,
                  "HTTP response status code not OK"
                );
                photos = JSON.parse(responseBody);

                const real_photos = models.photoOfUserModel(realUser._id);

                assert.strictEqual(
                  real_photos.length,
                  photos.length,
                  "wrong number of photos returned"
                );
                _.forEach(real_photos, function (real_photo) {
                  const matches = _.filter(photos, function (photoCandidate) {
                    return photoCandidate.file_name === real_photo.file_name
                      || photoCandidate.file_name.endsWith('/' + real_photo.file_name);
                  });
                  assert.strictEqual(
                    matches.length,
                    1,
                    " looking for photo " + real_photo.file_name
                  );
                  const photo = matches[0];
                  const extraProps1 = _.difference(
                    Object.keys(removeMongoProperties(photo)),
                    photoProperties
                  );
                  assert.strictEqual(
                    extraProps1.length,
                    0,
                    "photo object has extra properties: " + extraProps1
                  );
                  assert.strictEqual(photo.user_id, id);
                  assertEqualDates(photo.date_time, real_photo.date_time);
                  assert(
                    photo.file_name === real_photo.file_name
                      || photo.file_name.endsWith('/' + real_photo.file_name),
                    'photo file_name should match seeded filename or Cloudinary URL'
                  );

                  if (real_photo.comments) {
                    assert.strictEqual(
                      photo.comments.length,
                      real_photo.comments.length,
                      "comments on photo " + real_photo.file_name
                    );

                    _.forEach(real_photo.comments, function (real_comment) {
                      const comment = _.find(photo.comments, {
                        comment: real_comment.comment,
                      });
                      assert(comment);
                      const extraProps2 = _.difference(
                        Object.keys(removeMongoProperties(comment)),
                        commentProperties
                      );
                      assert.strictEqual(
                        extraProps2.length,
                        0,
                        "comment object has extra properties: " + extraProps2
                      );
                      assertEqualDates(
                        comment.date_time,
                        real_comment.date_time
                      );

                      const extraProps3 = _.difference(
                        Object.keys(removeMongoProperties(comment.user)),
                        userListProperties
                      );
                      assert.strictEqual(
                        extraProps3.length,
                        0,
                        "comment user object has extra properties: " +
                          extraProps3
                      );
                      assert.strictEqual(
                        comment.user.first_name,
                        real_comment.user.first_name
                      );
                      assert.strictEqual(
                        comment.user.last_name,
                        real_comment.user.last_name
                      );
                    });
                  } else {
                    assert(!photo.comments || photo.comments.length === 0);
                  }
                });
                callback();
              });
            }
          );
        },
        function () {
          done();
        }
      );
    });

    it("can return a 400 status on an invalid id to photosOfUser", function (done) {
      http.get(
        {
          hostname: host,
          port: port,
          path: "/photosOfUser/1",
          headers: { Cookie: authCookie },
        },
        function (response) {
          response.on("data", function () {});
          response.on("end", function () {
            assert.strictEqual(response.statusCode, 400);
            done();
          });
          response.on("error", function (err) {
            done(err);
          });
        }
      ).on("error", function (err) {
        done(err);
      });
    });
  });

  describe("test /photos", function () {
    const uploadedPhotoUrl = `https://example.com/upload-${Date.now()}.jpg`;

    it("can save a photo URL with /photos", function (done) {
      const postBody = JSON.stringify({ url: uploadedPhotoUrl });

      const options = {
        hostname: host,
        port,
        path: "/photos",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": postBody.length,
          Cookie: authCookie,
        },
      };

      const request = http.request(options, function (response) {
        let responseBody = "";
        response.on("data", function (chunk) {
          responseBody += chunk;
        });

        response.on("end", function () {
          assert.strictEqual(response.statusCode, 200);
          const uploadedPhoto = JSON.parse(responseBody);
          assert.strictEqual(uploadedPhoto.file_name, uploadedPhotoUrl);
          assert.strictEqual(uploadedPhoto.user_id.toString(), sessionUser._id);
          done();
        });
      });

      request.write(postBody);
      request.end();
    });

    it("persists the uploaded photo URL for the logged-in user", function (done) {
      http.get(
        {
          hostname: host,
          port,
          path: `/photosOfUser/${sessionUser._id}`,
          headers: { Cookie: authCookie },
        },
        function (response) {
          let responseBody = "";
          response.on("data", function (chunk) {
            responseBody += chunk;
          });

          response.on("end", function () {
            assert.strictEqual(response.statusCode, 200);
            const photos = JSON.parse(responseBody);
            const uploadedPhoto = _.find(photos, {
              file_name: uploadedPhotoUrl,
            });
            assert(uploadedPhoto, "expected to find the uploaded photo URL");
            assert.strictEqual(uploadedPhoto.user_id.toString(), sessionUser._id);
            done();
          });
        }
      ).on("error", function (err) {
        done(err);
      });
    });

    it("returns 400 when /photos is missing a url", function (done) {
      const postBody = JSON.stringify({});

      const options = {
        hostname: host,
        port,
        path: "/photos",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": postBody.length,
          Cookie: authCookie,
        },
      };

      const request = http.request(options, function (response) {
        response.on("data", function () {});
        response.on("end", function () {
          assert.strictEqual(response.statusCode, 400);
          done();
        });
      });

      request.write(postBody);
      request.end();
    });

    it("returns 401 when /photos is unauthenticated", function (done) {
      const postBody = JSON.stringify({ url: uploadedPhotoUrl });

      const options = {
        hostname: host,
        port,
        path: "/photos",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": postBody.length,
        },
      };

      const request = http.request(options, function (response) {
        response.on("data", function () {});
        response.on("end", function () {
          assert.strictEqual(response.statusCode, 401);
          done();
        });
      });

      request.write(postBody);
      request.end();
    });
  });

  describe("test /photos/:photoId/like", function () {
    let seedPhoto;
    let likedPhotoPath;

    before(function (done) {
      // Fetch the real photos for the logged-in session user from the API
      // so we operate on DB document ids rather than modelData ids which
      // are not persisted in MongoDB with the same _id values.
      const options = {
        hostname: host,
        port,
        path: `/photosOfUser/${sessionUser._id}`,
        method: 'GET',
        headers: { Cookie: authCookie },
      };

      const req = http.request(options, function (res) {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode !== 200) {
            return done(new Error('Failed to fetch photosOfUser: ' + res.statusCode));
          }

          const photos = JSON.parse(body);
          if (!Array.isArray(photos) || photos.length === 0) {
            return done(new Error('No photos found for session user'));
          }

          seedPhoto = photos[0];
          likedPhotoPath = `/photos/${seedPhoto._id}/like`;
          return done();
        });
      });

      req.on('error', done);
      req.end();
    });

    it("adds a like to the photo", function (done) {
      const request = http.request(
        {
          hostname: host,
          port,
          path: likedPhotoPath,
          method: "POST",
          headers: { Cookie: authCookie },
        },
        function (response) {
          let responseBody = "";
          response.on("data", function (chunk) {
            responseBody += chunk;
          });

          response.on("end", function () {
            assert.strictEqual(response.statusCode, 200);
            const likedPhoto = JSON.parse(responseBody);
            assert(
              likedPhoto.likes.some(
                (id) => id.toString() === sessionUser._id.toString()
              ),
              "expected the logged-in user to be present in likes"
            );
            done();
          });
        }
      );

      request.end();
    });

    it("removes the like on a second request from the same user", function (done) {
      const request = http.request(
        {
          hostname: host,
          port,
          path: likedPhotoPath,
          method: "POST",
          headers: { Cookie: authCookie },
        },
        function (response) {
          let responseBody = "";
          response.on("data", function (chunk) {
            responseBody += chunk;
          });

          response.on("end", function () {
            assert.strictEqual(response.statusCode, 200);
            const unlikedPhoto = JSON.parse(responseBody);
            assert.strictEqual(
              unlikedPhoto.likes.filter(
                (id) => id.toString() === sessionUser._id.toString()
              ).length,
              0,
              "expected the logged-in user to be removed from likes"
            );
            done();
          });
        }
      );

      request.end();
    });

    it("returns 401 when liking a photo without authentication", function (done) {
      const request = http.request(
        {
          hostname: host,
          port,
          path: likedPhotoPath,
          method: "POST",
        },
        function (response) {
          response.on("data", function () {});
          response.on("end", function () {
            assert.strictEqual(response.statusCode, 401);
            done();
          });
        }
      );

      request.end();
    });
  });
});
