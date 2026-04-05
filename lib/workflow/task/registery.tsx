import { Tasktype } from "@/types/task";
import { ExtractTextFromElementTask } from "./ExtractTextElement";
import { LaunchBrowserTask } from "./LaunchBrowser";
import { PageToHtmlTask } from "./PageToHtml";
import { WorkflowTask } from "@/types/workflow";

type  Registry = {
    [K in Tasktype] : WorkflowTask & {type : K}
}
export const TaskRegistry : Registry = {
    LAUNCH_BROWSER : LaunchBrowserTask,
    PAGE_TO_HTML : PageToHtmlTask,
    EXTRACT_TEXT_FROM_ELEMENT : ExtractTextFromElementTask
}