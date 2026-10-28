// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'

import IdentificationGuide from '../IdentificationGuide.jsx'


const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}))


vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})


function startGuide() {
  render(<IdentificationGuide />)

  fireEvent.click(
    screen.getByRole('button', {
      name: /I understand/i,
    })
  )
}


function answerAndNext(answer) {
  fireEvent.click(
    screen.getByRole('button', {
      name: answer,
    })
  )

  const nextButton =
    screen.queryByRole('button', { name: 'Next' }) ||
    screen.getByRole('button', { name: 'See likely match' })

  fireEvent.click(nextButton)
}


// Answers that lead to a Grey Warbler result in the 16-species guide
function answerGreyWarblerPath() {
  answerAndNext('Enclosed dome / hanging pouch')
  answerAndNext('Small / about palm-sized')
  answerAndNext('Hanging / suspended')
  answerAndNext('Yes, side entrance')
  answerAndNext("Not sure / can't tell")
  answerAndNext('None of these / unsure')
}


describe('Sprint 5 Identification Guide Component Tests', () => {

  beforeEach(() => {
    mockNavigate.mockClear()
  })

  // Remove the rendered guide after each test so tests do not see each other's screens
  afterEach(() => {
    cleanup()
  })


  // ---------------------------------------------------------
  // TC-29 Grey Warbler Priority Matching Component Test
  // ---------------------------------------------------------
  test('TC-29 Grey Warbler priority matching', () => {

    startGuide()
    answerGreyWarblerPath()

    expect(
      screen.getByText(/Grey Warbler \/ Riroriro/i)
    ).toBeTruthy()
  })


  // ---------------------------------------------------------
  // TC-30 Unknown Result Component Test
  // ---------------------------------------------------------
  test('TC-30 Unknown result', () => {

    startGuide()

    answerAndNext('Not sure')
    answerAndNext('Not sure')
    answerAndNext('Not sure')
    answerAndNext('Cannot tell')
    answerAndNext("Not sure / can't tell")
    answerAndNext('None of these / unsure')

    expect(
      screen.getByText('Not sure yet')
    ).toBeTruthy()

    // With no suggestion there is nothing to reject, so this button is hidden
    expect(
      screen.queryByRole('button', { name: /That's not my nest/i })
    ).toBeNull()

    // The user can still start again or submit as an unknown nest
    expect(
      screen.getByRole('button', { name: /Start again/i })
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: /Submit a report/i })
    ).toBeTruthy()
  })


  // ---------------------------------------------------------
  // TC-31 Guide Reset State Component Test
  // ---------------------------------------------------------
  test('TC-31 Guide reset state', () => {
    startGuide()
    answerGreyWarblerPath()

    fireEvent.click(
      screen.getByRole('button', {
        name: /Start again/i,
      })
    )

    expect(
      screen.getByText('Step 1 of 6')
    ).toBeTruthy()
    expect(
      screen.getByText('What shape is the nest?')
    ).toBeTruthy()

    const nextButton = screen.getByRole('button', {
      name: 'Next',
    })
    expect(nextButton.disabled).toBe(true)
  })


  // ---------------------------------------------------------
  // TC-32 Guide Result Data Transfer Component Test
  // ---------------------------------------------------------
  test('TC-32 Guide result data transfer', () => {
    startGuide()

    answerAndNext('Open cup or bowl')
    answerAndNext('Small / about palm-sized')
    answerAndNext('In a fork')
    answerAndNext('No, open top')
    answerAndNext('Small cup with grasses')
    answerAndNext('None of these / unsure')

    fireEvent.click(
      screen.getByRole('button', {
        name: /Submit a report/i,
      })
    )

    expect(mockNavigate).toHaveBeenCalledWith(
      '/report',
      {
        state: {
          guideAnswers: expect.objectContaining({
            nest_shape: 'Open cup or bowl',
            size_category: 'Small / about palm-sized',
            position_type: 'In a fork',
            entrance_visible: 'No, open top',
            inside_visible: 'Small cup with grasses',
            extra_detail: 'None of these / unsure',
            key_result: 'silvereye',
            user_clicked_not_my_nest: 'no',
            confidence_level: 'medium',
            researcher_final_id: 'pending',
            verification_status: 'unverified',
          }),
        },
      }
    )
  })


  // ---------------------------------------------------------
  // TC-33 (new in Sprint 5) "That's not my nest" moves to the next
  // possibility, then to "Not sure yet", and is recorded on submit
  // ---------------------------------------------------------
  test("TC-33 That's not my nest cycles to the next result", () => {
    startGuide()

    // Tiny neat cup: best guess Chaffinch, then Goldfinch, then Silvereye
    answerAndNext('Open cup or bowl')
    answerAndNext('Small / about palm-sized')
    answerAndNext('In a fork')
    answerAndNext('No, open top')
    answerAndNext("Not sure / can't tell")
    answerAndNext('A tiny, neat cup that blends into the branch')

    expect(screen.getByText(/Chaffinch \/ Pahirini/i)).toBeTruthy()

    fireEvent.click(
      screen.getByRole('button', { name: /That's not my nest/i })
    )

    expect(screen.getByText(/European Goldfinch/i)).toBeTruthy()

    fireEvent.click(
      screen.getByRole('button', { name: /Submit a report/i })
    )

    expect(mockNavigate).toHaveBeenCalledWith(
      '/report',
      {
        state: {
          guideAnswers: expect.objectContaining({
            key_result: 'goldfinch',
            user_clicked_not_my_nest: 'yes',
          }),
        },
      }
    )
  })

})