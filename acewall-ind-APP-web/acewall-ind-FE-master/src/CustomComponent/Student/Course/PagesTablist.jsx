import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TabsContent } from "@/components/ui/tabs";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";

const PagesTablist = ({ chapter, lesson }) => {
  const [chapterPages, setChapterPages] = useState([]);
  const [lessonPages, setLessonPages] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  const getPagesForChapter = async () => {
    try {
      const response = await axiosInstance.get(
        `pages/getChapterPages/${chapter._id}`
      );

      setChapterPages(response.data.pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  };

  const getPagesForLesson = async () => {
    if (!lesson) return;
    try {
      await axiosInstance
        .get(`/pages/getLessonPages/${lesson._id}`)
        .then((res) => {
          console.log(res, "page for lesson");
          setLessonPages(res.data.pages);
        });
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  };

  useEffect(() => {
    getPagesForChapter();
    getPagesForLesson();
  }, [lesson]);
  return (
    <section>
      <TabsContent value="pages" className="p-6 bg-white rounded-lg shadow-md">
        <p className="text-lg font-semibold text-gray-700 mb-4">
          Chapter Pages
        </p>
        {chapterPages?.length === 0 ? (
          <p className="text-sm text-gray-500 mt-4">
            No pages found for this chapter
          </p>
        ) : (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapterPages.map((post) => (
              <div
                key={post._id}
                id={`page-${post._id}`}
                className="bg-white border rounded-lg shadow-sm p-4 space-y-4 hover:shadow-md cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold truncate max-w-[80%]">
                    {post.title}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePage(post._id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-line">
                  {post.description}
                </p>
                {post.image?.url && (
                  <img
                    src={post.image.url}
                    alt="Post visual"
                    className="w-full h-48 object-cover rounded-md border"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-lg font-semibold text-gray-700 mb-4">
            Lesson Pages
          </p>

          {lessonPages?.length === 0 || !lesson ? (
            <p className="text-sm text-gray-500 mt-4">
              No pages found for this Lesson
            </p>
          ) : (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessonPages.map((post) => (
                <div
                  key={post._id}
                  id={`page-${post._id}`}
                  className="bg-white border rounded-lg shadow-sm p-4 space-y-4 hover:shadow-md cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold truncate max-w-[80%]">
                      {post.title}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePage(post._id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-line">
                    {post.description}
                  </p>
                  {post.image?.url && (
                    <img
                      src={post.image.url}
                      alt="Post visual"
                      className="w-full h-48 object-cover rounded-md border"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      {selectedPost && (
        <Dialog
          open={!!selectedPost}
          onOpenChange={() => setSelectedPost(null)}
        >
          <DialogContent className=" !max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {selectedPost?.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {selectedPost.image?.url && (
                <img
                  src={selectedPost.image.url}
                  alt="Page visual"
                  className="w-full object-contain rounded-md border max-h-[70vh]"
                />
              )}

              <p className="text-sm text-gray-700 whitespace-pre-line">
                {selectedPost?.description}
              </p>

              {selectedPost.files?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Attachments:</h4>
                  <ul className="list-disc pl-5 text-sm text-blue-600">
                    {selectedPost.files.map((file, idx) => (
                      <li key={idx}>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          {file.filename}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
};

export default PagesTablist;
