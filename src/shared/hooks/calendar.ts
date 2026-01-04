export const getMonthInfo = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-based

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    year,
    month, // 0-based
    daysInMonth: lastDay.getDate(),
    startDay: firstDay.getDay(), // 0(일) ~ 6(토)
  };
};

export const useCalendar = (selectedDate: Date) => {
  const { year, month, daysInMonth, startDay } = getMonthInfo(selectedDate);

  const cells: (number | null)[] = [];

  // 앞쪽 빈 칸
  for (let i = 0; i < startDay; i++) {
    cells.push(null);
  }

  // 날짜 채우기
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day);
  }

  return {
    year,
    month,
    cells, // 렌더링용
  };
};

import { useEffect, useState } from "react";

export const useMonthlyActivityMap = ({
  tasks,
  taskLogs,
}: {
  tasks: { date: string }[];
  taskLogs: { date: string; completed: boolean }[];
}) => {
  const [map, setMap] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    const next = new Map<string, boolean>();

    tasks.forEach((task) => {
      next.set(task.date, true);
    });

    taskLogs.forEach((log) => {
      if (log.completed) {
        next.set(log.date, true);
      }
    });

    setMap(next);
  }, [tasks, taskLogs]);

  return map;
};

import { useAuth } from "@/shared/hooks/useAuth";
import { getTasksByMonth } from "../api/task";
import { getTaskLogsByMonth } from "../api/taskLog";

export const useMonthlyData = (date: Date) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskLogs, setTaskLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const unsubscribeTasks = getTasksByMonth({
      userId: user.uid,
      date,
      onChange: setTasks,
    });

    const unsubscribeLogs = getTaskLogsByMonth({
      userId: user.uid,
      date,
      onChange: setTaskLogs,
    });

    return () => {
      unsubscribeTasks();
      unsubscribeLogs();
    };
  }, [user, date]);

  return { tasks, taskLogs };
};
