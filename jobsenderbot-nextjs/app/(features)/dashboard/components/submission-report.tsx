"use client";

import { JobSubmission } from "@/app/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getLatestUserSubmissions,
  getUserSubmissions,
} from "../service/get_user_submissions";
import { useAuth } from "../../auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const threshold = 1;
const root = null;
const rootMargin = "0px";

export function SubmissionReport() {
  const [data, setData] = useState<JobSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    const inteervalId = setInterval(() => {
      getLatestUserSubmissions(
        user!.email,
        data.length === 0 ? -1 : data[0].id,
      ).then((res) => {
        if (!res.success) {
          toast.error(res.message);
          return;
        }

        setData((prev) => [...res.data, ...prev]);
      });
    }, 10000);

    return () => {
      clearInterval(inteervalId);
    };
  }, [user, setData, data]);

  const next = useCallback(() => {
    setIsLoading(true);

    getUserSubmissions(
      user!.email,
      1,
      data.length === 0 ? null : data[data.length - 1].id,
    )
      .then((res) => {
        if (!res.success) {
          toast.error(res.message);
          setHasMore(false);
          return;
        }

        setHasMore(res.data.length !== 0);
        setData((prev) => [...prev, ...res.data]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [data, setData, setIsLoading, setHasMore, user]);

  const observer = useRef<IntersectionObserver>();
  const observerRef = useCallback(
    (element: HTMLElement | null) => {
      let safeThreshold = threshold;
      if (threshold < 0 || threshold > 1) {
        console.warn(
          "threshold should be between 0 and 1. You are exceed the range. will use default value: 1",
        );
        safeThreshold = 1;
      }
      if (isLoading) return;

      if (observer.current) observer.current.disconnect();
      if (!element) return;

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            next();
          }
        },
        { threshold: safeThreshold, root, rootMargin },
      );
      observer.current.observe(element);
    },
    [hasMore, isLoading, next, threshold, root, rootMargin],
  );

  if (!user) return null;

  return (
    <Table>
      <TableCaption>A list of your job submissions.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Recruiter</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Link</TableHead>
          <TableHead>Resume</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.company}</TableCell>
            <TableCell>{item.title}</TableCell>
            <TableCell>
              {item.recruiter_link ? (
                <a href={item.recruiter_link} target="_blank">
                  <Button variant="link">Job Recruiter</Button>
                </a>
              ) : (
                <i className="text-muted-foreground">No recruiter</i>
              )}
            </TableCell>
            <TableCell>{item.location}</TableCell>
            <TableCell>
              {item.link ? (
                <a href={item.link} target="_blank">
                  <Button variant="link">Job</Button>
                </a>
              ) : (
                <i className="text-muted-foreground">No link</i>
              )}
            </TableCell>
            <TableCell>
              {item.pdf_path ? (
                <a
                  href={`${process.env.NEXT_PUBLIC_APP_URL}/resume/${item.pdf_path}`}
                  target="_blank"
                >
                  <Button variant="link">Resume</Button>
                </a>
              ) : (
                <i className="text-muted-foreground">No resume</i>
              )}
            </TableCell>
          </TableRow>
        ))}
        <div ref={observerRef}></div>
      </TableBody>
    </Table>
  );
}
