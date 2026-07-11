import { CreateDiscussionDialog } from "@/CustomComponent/createDiscussionModal";
import { axiosInstance } from "@/lib/AxiosInstance";
import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tabs } from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import BackButton from "@/CustomComponent/BackButton";
import { DiscussionCard } from "@/CustomComponent/Card";

const TeacherDiscussion = () => {
  const [discussion, setDiscussion] = useState([]);
  const [loading, setloading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState("course");

  const [searchParams] = useSearchParams();

  const type = searchParams.get("type");
  const typeId = searchParams.get("typeId");
  const courseId = searchParams.get("course");
  const semesterId = searchParams.get("semester");
  const quarterId = searchParams.get("quarter");

  useEffect(() => {
    const fetchDiscussions = async () => {
      setloading(true);
      const url =
        type === "all" ? `/discussion/all` : `/discussion/v2/${type}/${typeId}`;
      try {
        const res = await axiosInstance.get(url);
        setDiscussion(res.data.discussions);
      } catch (err) {
        // handle error if needed
      } finally {
        setloading(false);
      }
    };
    fetchDiscussions();
  }, [refresh]);

  return (
    <div>
      <div className="mb-3">
        <BackButton />
      </div>

      <div className="flex flex-col pb-2 gap-5">
        <p className="text-xl py-4 mb-8 pl-6 font-semibold bg-acewall-main text-white rounded-lg">
          {type?.slice(0, 1).toUpperCase() + type?.slice(1)} Discussions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {type !== "all" && type !== "course" && (
          <section className="flex justify-end">
            <div className="flex justify-end pb-5">
              <CreateDiscussionDialog
                setRefresh={setRefresh}
                refresh={refresh}
                semester={semesterId}
                quarter={quarterId}
              />
            </div>
          </section>
        )}

        <div className="w-full flex justify-center">
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : discussion?.length === 0 ? (
            <p className="text-center">No Discussion found</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
          {!loading &&
            discussion?.map((item) => (
              <DiscussionCard
                key={item._id}
                discussion={item}
                link={`/teacher/discussions/${item._id}?type=${type}&typeId=${typeId}&course=${courseId}&semester=${semesterId}&quarter=${quarterId}`}
              />
            ))}
        </div>
      </Tabs>
    </div>
  );
};

export default TeacherDiscussion;
