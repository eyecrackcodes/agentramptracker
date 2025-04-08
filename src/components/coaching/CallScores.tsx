"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import UpdateCallScore from "./UpdateCallScore";

interface CallScore {
  id: string;
  agent_id: string;
  date: string;
  call_type: string;
  script_adherence: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  closing_score?: number;
}

export default function CallScores({ agentId }: { agentId: string }) {
  const [callScores, setCallScores] = useState<CallScore[]>([]);
  const [isAddingScore, setIsAddingScore] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [calculatedScore, setCalculatedScore] = useState(0);

  // Define all script items to check
  const scriptItems = [
    // Intake
    "intro", "client_name", "phone", "texting", "callback", "address", "email",
    // Credibility
    "agency_size", "clients", "offices", "credentials", "questions",
    // Agenda
    "next_few_minutes", "dob", "work_status", "income", "banking", "motivation",
    // Options
    "recent_death", "replace_addon", "procrastination", "vague", "start_today", "any_questions",
    // Closing
    "recap", "luminary", "underwriting", "education", "coverage", "close", "payment", "commit", "button_up"
  ];

  useEffect(() => {
    fetchCallScores();
  }, [agentId]);

  useEffect(() => {
    // Calculate score based on checked items
    const calculateScore = () => {
      const checkedCount = scriptItems.filter(item => checkedItems[item]).length;
      const totalItems = scriptItems.length;
      const percentComplete = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
      
      console.log(`Calculating script adherence: ${checkedCount}/${totalItems} = ${percentComplete}%`);
      
      setCalculatedScore(percentComplete);
    };

    calculateScore();
  }, [checkedItems]);

  const fetchCallScores = async () => {
    try {
      const response = await fetch(`/api/call-scores?agentId=${agentId}`);
      if (!response.ok) throw new Error('Failed to fetch call scores');
      const data = await response.json();
      console.log('Call scores data received from API (full object):', JSON.stringify(data, null, 2));
      
      // Add more detailed logging for each score
      data.forEach((score: CallScore) => {
        console.log(`Score ${score.id} details:`, {
          script_adherence: score.script_adherence !== undefined ? `${score.script_adherence} (${typeof score.script_adherence})` : 'undefined',
          closing_score: score.closing_score !== undefined ? `${score.closing_score} (${typeof score.closing_score})` : 'undefined',
          display_value: getDisplayScore(score)
        });
      });
      
      setCallScores(data);
    } catch (error) {
      console.error('Error fetching call scores:', error);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCheckedItems(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      // Use the calculated score or manual input if provided
      const manualInputScore = formData.get('script_adherence') ? Number(formData.get('script_adherence')) : null;
      console.log('Manual input score:', manualInputScore);
      console.log('Calculated score from checklist:', calculatedScore);
      
      const finalScore = manualInputScore !== null ? manualInputScore : calculatedScore;
      console.log('Final score to be submitted:', finalScore);

      const requestData = {
        agent_id: agentId,
        call_date: formData.get('call_date'),
        call_type: 'final_expense',
        script_adherence: finalScore, // Use the final score value
        notes: formData.get('notes'),
        manager_id: 'db22d3d4-f970-45e3-ae5d-9ce20f236255' // Default manager ID
      };

      console.log('Sending request with data:', requestData);

      const response = await fetch('/api/call-scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.error || 'Failed to add call score');
      }
      
      const responseData = await response.json();
      console.log('API response data:', responseData);
      
      await fetchCallScores();
      setIsAddingScore(false);
      // Reset state
      setCheckedItems({});
    } catch (error) {
      console.error('Error adding call score:', error);
      alert(error instanceof Error ? error.message : 'Failed to add call score');
    }
  };

  const getDisplayScore = (score: CallScore) => {
    console.log(`Getting display score for card with id ${score.id}`);
    console.log(`Raw score data:`, JSON.stringify(score, null, 2));
    
    if (score.script_adherence !== undefined && score.script_adherence !== null) {
      console.log(`Using script_adherence value: ${score.script_adherence}`);
      return Math.round(score.script_adherence);
    } else if (score.closing_score !== undefined && score.closing_score !== null) {
      console.log(`Using closing_score value: ${score.closing_score}`);
      return Math.round(score.closing_score);
    } else {
      console.error(`No valid score found for card with id ${score.id}`);
      return 0; // Return 0 instead of throwing error to prevent UI breaks
    }
  };

  const getScoreColorClass = (score: CallScore) => {
    const displayScore = getDisplayScore(score);
    if (displayScore < 50) {
      return 'bg-red-500';
    } else if (displayScore < 75) {
      return 'bg-yellow-500';
    } else {
      return 'bg-green-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Final Expense Call Scores</h2>
        <Button onClick={() => setIsAddingScore(!isAddingScore)}>
          {isAddingScore ? "Cancel" : "Add Score"}
        </Button>
      </div>

      {isAddingScore && (
        <form onSubmit={handleSubmit} className="space-y-6 border p-6 rounded-lg">
          <div className="flex justify-between items-center gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="call_date">Call Date</Label>
              <Input
                id="call_date"
                name="call_date"
                type="date"
                required
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input
                id="customer_name"
                name="customer_name"
                type="text"
              />
            </div>
          </div>

          <Accordion type="multiple" className="space-y-2">
            <AccordionItem value="intake">
              <AccordionTrigger className="text-lg font-semibold">Intake</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="intro" 
                      name="intro" 
                      checked={checkedItems["intro"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="intro">Yourself or you and another - who do I have the pleasure of speaking with?</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="client_name" 
                      name="client_name" 
                      checked={checkedItems["client_name"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="client_name">Client full name with spelling - gender</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="phone" 
                      name="phone" 
                      checked={checkedItems["phone"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="phone">Phone-cell or landline</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="texting" 
                      name="texting" 
                      checked={checkedItems["texting"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="texting">If Cell - Texting you my picture- my NPN-I'm a licensed insurance agent-read about me & LL.</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="callback" 
                      name="callback" 
                      checked={checkedItems["callback"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="callback">Call me back direct line in the text message</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="address" 
                      name="address" 
                      checked={checkedItems["address"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="address">Verify coverage-physical home address-street w/apt-city,state,zip</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="email" 
                      name="email" 
                      checked={checkedItems["email"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="email">Do you have email - Recap after the call</Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="credibility">
              <AccordionTrigger className="text-lg font-semibold">Credibility</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="agency_size" 
                      name="agency_size" 
                      checked={checkedItems["agency_size"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="agency_size">One of the largest life insurance agencies - 5 star google - A+ BBB</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="clients" 
                      name="clients" 
                      checked={checkedItems["clients"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="clients">Past decade over 100,000</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="offices" 
                      name="offices" 
                      checked={checkedItems["offices"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="offices">Major offices Austin TX & Charlotte NC</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="credentials" 
                      name="credentials" 
                      checked={checkedItems["credentials"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="credentials">I'm in [city] and my name is...in my text my government look up #-verify credentials</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="questions" 
                      name="questions" 
                      checked={checkedItems["questions"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="questions">I shared a lot-any questions about me or the company - did I cover it pretty well?</Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="agenda">
              <AccordionTrigger className="text-lg font-semibold">Set Agenda & Eligibility</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="next_few_minutes" 
                      name="next_few_minutes" 
                      checked={checkedItems["next_few_minutes"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="next_few_minutes">Next few minute - qualify - how plans work - questions - pricing - YOU decide - Fair enough?</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="dob" 
                      name="dob" 
                      checked={checkedItems["dob"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="dob">Date of birth?</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="work_status" 
                      name="work_status" 
                      checked={checkedItems["work_status"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="work_status">Working or retired?</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="income" 
                      name="income" 
                      checked={checkedItems["income"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="income">Income - SS, Pension, Salary, Investments, Business</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="banking" 
                      name="banking" 
                      checked={checkedItems["banking"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="banking">Checking or savings - direct express</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="motivation" 
                      name="motivation" 
                      checked={checkedItems["motivation"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="motivation">Starting a quote - besides TV commercial - what made you realize need life insurance today?</Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="options">
              <AccordionTrigger className="text-lg font-semibold">4 Options</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="recent_death" 
                      name="recent_death" 
                      checked={checkedItems["recent_death"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="recent_death">Recent death - did they have coverage</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="replace_addon" 
                      name="replace_addon" 
                      checked={checkedItems["replace_addon"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="replace_addon">Replace/add on - does it make sense to replace/add on</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="procrastination" 
                      name="procrastination" 
                      checked={checkedItems["procrastination"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="procrastination">Procrastination - Goodwill - Kick the can - Let's take care of this today- who is Bene</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="vague" 
                      name="vague" 
                      checked={checkedItems["vague"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="vague">Vague Response - 3 reasons-recent death, replace add on, today is the day-who is Bene</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="start_today" 
                      name="start_today" 
                      checked={checkedItems["start_today"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="start_today">When we find the plan fits needs & budget - start today?</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="any_questions" 
                      name="any_questions" 
                      checked={checkedItems["any_questions"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="any_questions">Any questions for me?</Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="closing">
              <AccordionTrigger className="text-lg font-semibold">Education & Closing</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="recap" 
                      name="recap" 
                      checked={checkedItems["recap"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="recap">Emotional Recap</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="luminary" 
                      name="luminary" 
                      checked={checkedItems["luminary"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="luminary">Luminary Life Index</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="underwriting" 
                      name="underwriting" 
                      checked={checkedItems["underwriting"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="underwriting">Underwriting with 19 questions</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="education" 
                      name="education" 
                      checked={checkedItems["education"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="education">Education on policy types</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="coverage" 
                      name="coverage" 
                      checked={checkedItems["coverage"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="coverage">Coverage Levels & Pricing</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="close" 
                      name="close" 
                      checked={checkedItems["close"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="close">The Close</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="payment" 
                      name="payment" 
                      checked={checkedItems["payment"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="payment">Payment Options</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="commit" 
                      name="commit" 
                      checked={checkedItems["commit"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="commit">Commit before Submit</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="button_up" 
                      name="button_up" 
                      checked={checkedItems["button_up"] || false}
                      onChange={handleCheckboxChange}
                    />
                    <Label htmlFor="button_up">Button Up</Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Script Adherence Score <span className="text-sm font-normal text-gray-500">({calculatedScore}% based on completed items)</span></h3>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="script_adherence">
                    Manual Score (Optional):
                  </Label>
                  <Input
                    id="script_adherence"
                    name="script_adherence"
                    type="number"
                    min="0"
                    max="100"
                    placeholder={calculatedScore.toString()}
                    onChange={(e) => {
                      console.log('Manual score changed to:', e.target.value);
                      const newScore = e.target.value ? Number(e.target.value) : calculatedScore;
                      setCalculatedScore(newScore);
                    }}
                    className="w-32"
                  />
                  <p className="text-xs text-gray-500">Leave empty to use checklist score</p>
                </div>
                <div className="w-full">
                  <div className="bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${calculatedScore}%` }}></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {calculatedScore < 50 ? 'Needs Improvement' : calculatedScore < 75 ? 'Good' : 'Excellent'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Enter additional feedback..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">Save Score</Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsAddingScore(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {callScores.map((score) => (
          <Card key={score.id} className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">
                  Date: {new Date(score.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">Type: {score.call_type === 'final_expense' ? 'Final Expense' : score.call_type}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  Script Adherence: {getDisplayScore(score)}%
                </p>
                <div className="w-32 bg-gray-200 rounded-full h-2.5 mt-1">
                  <div 
                    className={`h-2.5 rounded-full ${getScoreColorClass(score)}`} 
                    style={{ width: `${getDisplayScore(score)}%` }}
                  ></div>
                </div>
                
                <div className="mt-2">
                  <UpdateCallScore 
                    callScoreId={score.id} 
                    initialValue={getDisplayScore(score)}
                    onSuccess={fetchCallScores}
                  />
                </div>
              </div>
            </div>
            {score.notes && (
              <div>
                <p className="font-medium">Notes:</p>
                <p className="text-sm">{score.notes}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
} 