let applications = [];
const form = document.querySelector("form");
const formError = document.querySelector("#form-error");
const emptyState = document.querySelector("#empty-state");
let loadFailed = false;

try {
  const savedApplicationsJSON = localStorage.getItem("applytrack-applications");
  if (savedApplicationsJSON !== null) {
    applications = JSON.parse(savedApplicationsJSON);
  }
} catch (error) {
  loadFailed = true;
  formError.textContent =
    "Couldn't load saved applications. Saving is paused. Refresh to try again.";
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  if (loadFailed === true) {
    return;
  }

  const company = document.querySelector("#company").value.trim();
  const role = document.querySelector("#job-role").value.trim();

  formError.textContent = "";
  if (!company || !role) {
    formError.textContent = "Enter a company and job role.";
    return;
  }

  const application = {
    company: company,
    role: role,
  };

  applications.push(application);
  try {
    const applicationsJSON = JSON.stringify(applications);
    localStorage.setItem("applytrack-applications", applicationsJSON);
  } catch (error) {
    applications.pop();
    formError.textContent =
      "Couldn’t save this application. Your entries are still here. Please try again.";
    return;
  }
  renderApplications();
  form.reset();
});

const applicationList = document.querySelector("#application-list");

function renderApplications() {
  applicationList.replaceChildren();

  if (applications.length === 0 && !loadFailed) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
  }

  for (const application of applications) {
    const item = document.createElement("li");
    item.classList.add("application-card");
    item.textContent = `${application.company} - ${application.role}`;
    applicationList.append(item);
  }
}

renderApplications();
